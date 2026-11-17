// Génère la voix off (une piste par scène) + timestamps mot à mot.
//   node scripts/tts.ts            -> ElevenLabs si ELEVENLABS_API_KEY présent,
//                                     sinon pistes muettes provisoires (timing estimé)
//   node scripts/tts.ts --only s3  -> régénère une seule scène
// Sortie : public/voice/<id>.mp3 + src/voice-manifest.json
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {EDGE_VOICE, SCENES, VOICE} from '../src/constants.ts';

type Word = {text: string; start: number; end: number};
type SceneVoice = {id: string; file: string; duration: number; words: Word[]};
type Manifest = {placeholder: boolean; provider: string; voiceId: string | null; scenes: SceneVoice[]};

const root = path.resolve(import.meta.dirname, '..');
const voiceDir = path.join(root, 'public', 'voice');
const manifestPath = path.join(root, 'src', 'voice-manifest.json');
fs.mkdirSync(voiceDir, {recursive: true});

// --- .env -------------------------------------------------------------------
const envFile = path.join(root, '.env');
if (fs.existsSync(envFile)) {
	for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
		const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
		if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
	}
}
const apiKey = process.env.ELEVENLABS_API_KEY?.trim() || '';
const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;

const API = 'https://api.elevenlabs.io/v1';

const probeDuration = (file: string) =>
	Number(
		execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file])
			.toString()
			.trim(),
	);

// Regroupe l'alignement caractère par caractère en mots, en ignorant
// les balises <break .../> et la ponctuation isolée (« : », « ? »…).
const wordsFromAlignment = (chars: string[], starts: number[], ends: number[]): Word[] => {
	const words: Word[] = [];
	let cur: Word | null = null;
	let inTag = false;
	const flush = () => {
		if (!cur) return;
		const t = cur.text.trim();
		if (/^[\p{P}\s]+$/u.test(t) && words.length) {
			// ponctuation seule (ex. « ? » après une espace insécable) -> accrochée au mot précédent
			words[words.length - 1].text += t;
			words[words.length - 1].end = Math.max(words[words.length - 1].end, cur.end);
		} else if (t) {
			words.push({...cur, text: t});
		}
		cur = null;
	};
	chars.forEach((c, i) => {
		if (c === '<') inTag = true;
		if (inTag) {
			if (c === '>') inTag = false;
			return;
		}
		if (/\s/.test(c)) return flush();
		if (!cur) cur = {text: '', start: starts[i], end: ends[i]};
		cur.text += c;
		cur.end = ends[i];
	});
	flush();
	return words;
};

// --- Mode provisoire : timing estimé + piste muette ------------------------
const estimate = (tts: string): {words: Word[]; duration: number} => {
	const tokens = tts.split(/(<break[^>]*\/>)|\s+/).filter(Boolean);
	const words: Word[] = [];
	let t = 0.05;
	for (const tok of tokens) {
		const brk = tok.match(/time="([\d.]+)s"/);
		if (tok.startsWith('<')) {
			t += brk ? Number(brk[1]) : 0.3;
			continue;
		}
		if (/^[\p{P}]+$/u.test(tok) && words.length) {
			words[words.length - 1].text += tok;
			t += 0.25;
			continue;
		}
		const letters = tok.replace(/[^\p{L}\p{N}]/gu, '').length;
		const d = 0.09 + letters * 0.058;
		words.push({text: tok, start: +t.toFixed(3), end: +(t + d).toFixed(3)});
		t += d + 0.03;
		if (/[.…]$/.test(tok)) t += 0.3;
		else if (/[?!:]$/.test(tok)) t += 0.25;
		else if (/,$/.test(tok)) t += 0.12;
	}
	return {words, duration: +(t + 0.1).toFixed(3)};
};

const silentMp3 = (file: string, seconds: number) =>
	execFileSync('ffmpeg', [
		'-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono',
		'-t', String(seconds), '-c:a', 'libmp3lame', '-b:a', '64k', file,
	]);

// --- ElevenLabs -------------------------------------------------------------
const pickVoice = async (): Promise<string> => {
	if (process.env.ELEVENLABS_VOICE_ID?.trim()) return process.env.ELEVENLABS_VOICE_ID.trim();
	const res = await fetch(`${API}/voices`, {headers: {'xi-api-key': apiKey}});
	if (!res.ok) throw new Error(`GET /voices -> ${res.status} ${await res.text()}`);
	const {voices} = (await res.json()) as {
		voices: {voice_id: string; name: string; category?: string; labels?: Record<string, string>}[];
	};
	const male = voices.filter((v) => (v.labels?.gender ?? '').toLowerCase() === VOICE.gender);
	const isFr = (v: (typeof voices)[number]) =>
		/fr|french|fran/i.test(`${v.labels?.language ?? ''} ${v.labels?.accent ?? ''}`);
	const chosen = male.find(isFr) ?? male[0] ?? voices[0];
	if (!chosen) throw new Error('Aucune voix disponible sur ce compte ElevenLabs.');
	console.log(`Voix choisie : ${chosen.name} (${chosen.voice_id})${isFr(chosen) ? ' [FR]' : ' [multilingue]'}`);
	return chosen.voice_id;
};

const synth = async (voiceId: string, i: number) => {
	const scene = SCENES[i];
	const strip = (s?: string) => s?.replace(/<[^>]+>/g, '');
	const res = await fetch(
		`${API}/text-to-speech/${voiceId}/with-timestamps?output_format=${VOICE.outputFormat}`,
		{
			method: 'POST',
			headers: {'xi-api-key': apiKey, 'Content-Type': 'application/json'},
			body: JSON.stringify({
				text: scene.tts,
				model_id: VOICE.modelId,
				voice_settings: VOICE.settings,
				// continuité de prosodie entre les pistes
				previous_text: strip(SCENES[i - 1]?.tts),
				next_text: strip(SCENES[i + 1]?.tts),
			}),
		},
	);
	if (!res.ok) throw new Error(`TTS ${scene.id} -> ${res.status} ${await res.text()}`);
	const data = (await res.json()) as {
		audio_base64: string;
		alignment: {
			characters: string[];
			character_start_times_seconds: number[];
			character_end_times_seconds: number[];
		};
	};
	const file = path.join(voiceDir, `${scene.id}.mp3`);
	fs.writeFileSync(file, Buffer.from(data.audio_base64, 'base64'));
	const a = data.alignment;
	return {
		file,
		words: wordsFromAlignment(a.characters, a.character_start_times_seconds, a.character_end_times_seconds),
	};
};

// --- Edge TTS (gratuit) -----------------------------------------------------
const tmpDir = path.join(root, 'out', 'tts-tmp');
const cleanTok = (x: string) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

// Les WordBoundary n'ont pas la ponctuation : on la récupère depuis le texte source.
const reattachPunctuation = (words: Word[], source: string): Word[] => {
	const tokens = source.split(/\s+/).filter(Boolean);
	let k = 0;
	return words.map((w) => {
		const target = cleanTok(w.text);
		for (let j = k; j < tokens.length; j++) {
			if (cleanTok(tokens[j]).startsWith(target) && target) {
				k = j + 1;
				let text = tokens[j];
				while (tokens[k] && /^[\p{P}]+$/u.test(tokens[k])) text += tokens[k++]; // « : » « ? » isolés
				return {...w, text};
			}
		}
		return w;
	});
};

const synthEdge = (i: number) => {
	const scene = SCENES[i];
	fs.mkdirSync(tmpDir, {recursive: true});
	// découpe sur les <break time="Xs" /> -> segments + silences
	const parts = scene.tts.split(/<break\s+time="([\d.]+)s"\s*\/>/);
	const inputs: string[] = [];
	const words: Word[] = [];
	let t = 0;
	parts.forEach((part, k) => {
		if (k % 2 === 1) {
			const secs = Number(part);
			inputs.push('-f', 'lavfi', '-t', String(secs), '-i', 'anullsrc=r=24000:cl=mono');
			t += secs;
			return;
		}
		const text = part.trim();
		if (!text) return;
		const seg = path.join(tmpDir, `${scene.id}-${k}.mp3`);
		const out = execFileSync('python3', [
			path.join(root, 'scripts', 'edge_tts_seg.py'), EDGE_VOICE.voice, EDGE_VOICE.rate, EDGE_VOICE.pitch, seg, text,
		]).toString();
		const segWords = reattachPunctuation(JSON.parse(out) as Word[], text);
		// Edge ajoute du silence en tête/queue : on coupe au plus près de la parole
		// pour que les <break> donnent la vraie durée de pause.
		const dur = probeDuration(seg);
		const from = Math.max(0, (segWords[0]?.start ?? 0) - 0.04);
		const to = Math.min(dur, (segWords[segWords.length - 1]?.end ?? dur) + 0.28);
		const trimmed = seg.replace(/\.mp3$/, '-trim.wav');
		execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', seg, '-ss', String(from), '-to', String(to), '-af', 'afade=t=out:st=' + Math.max(0, to - from - 0.05) + ':d=0.05', trimmed]);
		segWords.forEach((w) => words.push({text: w.text, start: +(w.start - from + t).toFixed(3), end: +(w.end - from + t).toFixed(3)}));
		inputs.push('-i', trimmed);
		t += probeDuration(trimmed);
	});
	const n = inputs.filter((x) => x === '-i').length;
	const file = path.join(voiceDir, `${scene.id}.mp3`);
	const chain = Array.from({length: n}, (_, j) => `[${j}:a]aresample=44100,aformat=channel_layouts=mono[a${j}];`).join('') +
		Array.from({length: n}, (_, j) => `[a${j}]`).join('') + `concat=n=${n}:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100[out]`;
	execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', chain, '-map', '[out]', '-c:a', 'libmp3lame', '-b:a', '128k', file]);
	return {file, words};
};

// --- Main -------------------------------------------------------------------
const prev: Manifest | null = fs.existsSync(manifestPath)
	? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
	: null;

const provider = (process.env.TTS_PROVIDER?.trim() || (apiKey ? 'elevenlabs' : 'edge')) as 'elevenlabs' | 'edge' | 'silent';
const placeholder = provider === 'silent';
if (placeholder) console.warn('⚠ TTS_PROVIDER=silent : pistes MUETTES provisoires avec timing estimé.');
console.log(`Fournisseur voix : ${provider}${provider === 'edge' ? ` (${EDGE_VOICE.voice}, ${EDGE_VOICE.rate})` : ''}`);
const voiceId = provider === 'elevenlabs' ? await pickVoice() : provider === 'edge' ? EDGE_VOICE.voice : null;

const scenes: SceneVoice[] = [];
for (let i = 0; i < SCENES.length; i++) {
	const s = SCENES[i];
	const old = prev?.scenes.find((x) => x.id === s.id);
	if (only && only !== s.id && old && prev?.provider === provider) {
		scenes.push(old);
		continue;
	}
	let words: Word[];
	let file: string;
	if (placeholder) {
		const est = estimate(s.tts);
		file = path.join(voiceDir, `${s.id}.mp3`);
		silentMp3(file, est.duration);
		words = est.words;
	} else if (provider === 'edge') {
		({file, words} = synthEdge(i));
	} else {
		({file, words} = await synth(voiceId!, i));
	}
	const duration = +probeDuration(file).toFixed(3);
	scenes.push({id: s.id, file: `voice/${s.id}.mp3`, duration, words});
	console.log(`${s.id}  ${duration.toFixed(2)} s  ${words.map((w) => w.text).join(' ')}`);
}

const manifest: Manifest = {placeholder, provider, voiceId, scenes};
fs.rmSync(tmpDir, {recursive: true, force: true});
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, '\t') + '\n');
const total = scenes.reduce((a, s) => a + s.duration, 0);
console.log(`Voix totale : ${total.toFixed(2)} s -> ${path.relative(root, manifestPath)}`);
