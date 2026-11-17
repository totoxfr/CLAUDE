"""Voix off avec Chatterbox Multilingual (Resemble AI, open source, local, sans clé).

Lit sur stdin un JSON :
  {"scenes": [{"id", "tts", "spoken"?}], "outDir", "ref", "settings": {...}}
et écrit sur stdout un JSON : {"scenes": [{"id", "file", "words": [{text,start,end}], "score"}]}

- Les balises <break time="Xs" /> deviennent de vrais silences.
- Chaque segment est rogné au plus près de la parole.
- Les timestamps mot à mot viennent de faster-whisper, réalignés sur le texte du script.
- Contrôle qualité : si la transcription s'éloigne trop du texte (hallucination,
  mot avalé), la prise est régénérée avec une autre graine.
"""
import difflib
import json
import os
import re
import subprocess
import sys
import tempfile
import unicodedata

import librosa
import numpy as np
import soundfile as sf
import torch

torch.set_num_threads(os.cpu_count() or 4)

from chatterbox.mtl_tts import ChatterboxMultilingualTTS  # noqa: E402
from faster_whisper import WhisperModel  # noqa: E402

NUMS = {"0": "zero", "1": "un", "2": "deux", "3": "trois", "4": "quatre", "5": "cinq", "6": "six", "7": "sept", "8": "huit", "9": "neuf"}


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^a-z0-9]", "", s)
    return NUMS.get(s, s)


def split_breaks(text: str):
    parts = re.split(r'<break\s+time="([\d.]+)s"\s*/>', text)
    out = []
    for i, p in enumerate(parts):
        if i % 2 == 1:
            out.append(("pause", float(p)))
        elif p.strip():
            out.append(("text", p.strip()))
    return out


def trim(wav: np.ndarray, sr: int) -> np.ndarray:
    _, (a, b) = librosa.effects.trim(wav, top_db=38)
    a = max(0, a - int(0.03 * sr))
    b = min(len(wav), b + int(0.12 * sr))
    out = wav[a:b].copy()
    fade = int(0.02 * sr)
    out[-fade:] *= np.linspace(1, 0, fade)
    return out


def align(script_tokens, whisper_words, total):
    """Assigne à chaque mot du script le timing du mot Whisper correspondant."""
    a = [norm(t) for t in script_tokens]
    b = [norm(w["word"]) for w in whisper_words]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    times = [None] * len(script_tokens)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                w = whisper_words[j1 + k]
                times[i1 + k] = (w["start"], w["end"])
        elif tag == "replace" and j2 > j1:
            # ex. « GTA » transcrit « G.T.A. », « RP » -> « R.P. » : on répartit le bloc
            s, e = whisper_words[j1]["start"], whisper_words[j2 - 1]["end"]
            n = i2 - i1
            for k in range(n):
                times[i1 + k] = (s + (e - s) * k / n, s + (e - s) * (k + 1) / n)
    # interpolation des trous restants
    known = [i for i, t in enumerate(times) if t]
    for i, t in enumerate(times):
        if t:
            continue
        prev = max([k for k in known if k < i], default=None)
        nxt = min([k for k in known if k > i], default=None)
        s = times[prev][1] if prev is not None else 0.0
        e = times[nxt][0] if nxt is not None else total
        times[i] = (s, max(s + 0.05, e))
    score = sm.ratio()
    return [{"text": tok, "start": round(t[0], 3), "end": round(t[1], 3)} for tok, t in zip(script_tokens, times)], score


def plan_scene(tts: str, pron: dict):
    """Découpe le texte en segments (texte/pause) et construit les mots « parlés »
    rattachés à leur mot d'affichage (pour les sous-titres)."""
    segments, display, spoken_owner, spoken_tokens = [], [], [], []
    for kind, val in split_breaks(tts):
        if kind == "pause":
            segments.append(("pause", val))
            continue
        words_out = []
        toks = []
        for tok in val.split():
            # ponctuation isolée (« : », « ? » à la française) -> collée au mot précédent
            if re.fullmatch(r"[^\w]+", tok) and toks:
                toks[-1] += tok
            else:
                toks.append(tok)
        for tok in toks:
            di = len(display)
            display.append(tok)
            say = pron.get(tok, tok).replace("…", ",")
            for st in say.split():
                words_out.append(st)
                spoken_tokens.append(st)
                spoken_owner.append(di)
        segments.append(("text", " ".join(words_out)))
    return segments, display, spoken_tokens, spoken_owner


def transcribe(asr, path):
    segs, _ = asr.transcribe(path, language="fr", word_timestamps=True, beam_size=5, vad_filter=False)
    return [{"word": w.word, "start": w.start, "end": w.end} for s in segs for w in (s.words or [])]


def to_display(display, owner, sp_words):
    words = []
    for di, tok in enumerate(display):
        idx = [k for k, o in enumerate(owner) if o == di]
        words.append({"text": tok, "start": sp_words[idx[0]]["start"], "end": sp_words[idx[-1]]["end"]})
    return words


def main():
    job = json.load(sys.stdin)
    st = job["settings"]
    pron = job.get("pronunciation", {})
    align_only = job.get("alignOnly", False)
    log("Chargement faster-whisper…")
    asr = WhisperModel(st.get("whisperModel", "small"), device="cpu", compute_type="int8")
    results = []
    if align_only:
        # Pistes déjà présentes (générées, ou enregistrées à la main) : timestamps seulement.
        for scene in job["scenes"]:
            _, display, spoken_tokens, owner = plan_scene(scene["tts"], pron)
            out = os.path.join(job["outDir"], f"{scene['id']}.mp3")
            dur = librosa.get_duration(path=out)
            ww = transcribe(asr, out)
            sp_words, score = align(spoken_tokens, ww, dur)
            log(f"{scene['id']} alignement : score {score:.2f} | entendu : {' '.join(w['word'].strip() for w in ww)}")
            results.append({"id": scene["id"], "file": out, "words": to_display(display, owner, sp_words), "score": round(score, 3)})
        return results
    log("Chargement Chatterbox Multilingual (CPU)…")
    model = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
    sr = model.sr
    tmp = tempfile.mkdtemp()
    for scene in job["scenes"]:
        segments, display, spoken_tokens, owner = plan_scene(scene["tts"], pron)
        expected = sum(len(v) for k, v in segments if k == "text") * 0.075 + sum(v for k, v in segments if k == "pause")
        best = None
        for attempt in range(st.get("maxTries", 3)):
            seed = st.get("seed", 7) + attempt * 101
            torch.manual_seed(seed)
            np.random.seed(seed)
            chunks = []
            for kind, val in segments:
                if kind == "pause":
                    chunks.append(np.zeros(int(val * sr), dtype=np.float32))
                    continue
                wav = model.generate(
                    val,
                    language_id="fr",
                    audio_prompt_path=job["ref"],
                    exaggeration=st["exaggeration"],
                    cfg_weight=st["cfgWeight"],
                    temperature=st["temperature"],
                )
                chunks.append(trim(wav.squeeze(0).cpu().numpy().astype(np.float32), sr))
            audio = np.concatenate(chunks)
            dur = len(audio) / sr
            raw = os.path.join(tmp, f"{scene['id']}-{attempt}.wav")
            sf.write(raw, audio, sr)
            ww = transcribe(asr, raw)
            sp_words, score = align(spoken_tokens, ww, dur)
            # fidélité aussi mesurée sur le texte d'affichage (« RP » entendu = « erre pé » dit)
            heard_n = [norm(w["word"]) for w in ww]
            score = max(score, difflib.SequenceMatcher(a=[norm(t) for t in display], b=heard_n, autojunk=False).ratio())
            # pénalité si la prise est anormalement longue (babillage) ou courte (mots avalés)
            ratio = dur / max(0.5, expected)
            if ratio > 1.5 or ratio < 0.55:
                score *= 0.6
            heard = " ".join(w["word"].strip() for w in ww)
            log(f"{scene['id']} essai {attempt + 1} : score {score:.2f} durée {dur:.2f}s (attendu ~{expected:.1f}s) | entendu : {heard}")
            if not best or score > best[1]:
                best = (raw, score, sp_words)
            if score >= st.get("minScore", 0.8):
                break
        raw, score, sp_words = best
        # regroupe les mots parlés sur les mots d'affichage
        words = to_display(display, owner, sp_words)
        out = os.path.join(job["outDir"], f"{scene['id']}.mp3")
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100",
             "-ac", "1", "-c:a", "libmp3lame", "-b:a", "160k", out],
            check=True,
        )
        results.append({"id": scene["id"], "file": out, "words": words, "score": round(score, 3)})
    return results


if __name__ == "__main__":
    # stdout est réservé au JSON final : tout ce que les librairies impriment part sur stderr.
    real_stdout = sys.stdout
    sys.stdout = sys.stderr
    res = main()
    real_stdout.write(json.dumps({"scenes": res}, ensure_ascii=False) + "\n")
