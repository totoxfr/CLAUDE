# GTA 6 va créer des millionnaires — motion design vertical

Remotion (React + TypeScript), 1080×1920, 30 fps, ~45 s.

## Démarrage

```bash
npm install
pip install edge-tts        # voix gratuite (aucune clé nécessaire)
npm run tts                 # génère public/voice/s1..s7.mp3 + src/voice-manifest.json (timestamps mot à mot)
npm run sfx                 # SFX de secours synthétisés (n'écrase pas les tiens)
npm run studio              # preview
npm run stills              # frames clés -> out/frames/ (contrôle visuel)
npm run render              # -> out/gta6-millionnaires.mp4 (H.264, CRF 18)
```

`npm run tts -- --only s3` régénère une seule scène.

### Voix

Ordre de choix automatique : **ElevenLabs** si `ELEVENLABS_API_KEY` est défini, sinon **Chatterbox** s'il est installé, sinon Edge. `TTS_PROVIDER=chatterbox|edge|elevenlabs|silent` force un fournisseur.

#### Chatterbox (par défaut, gratuit, local)

[resemble-ai/chatterbox](https://github.com/resemble-ai/chatterbox), modèle multilingue, en français, sur CPU (pas besoin de GPU).

```bash
pip install uv
uv venv --python 3.11 .venv-tts
VIRTUAL_ENV=.venv-tts uv pip install torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cpu
VIRTUAL_ENV=.venv-tts uv pip install chatterbox-tts==0.1.7 faster-whisper "setuptools<81"
npm run tts        # ~10-15 min sur 4 cœurs CPU
```

- **Timbre** : Chatterbox clone une voix de référence de 10 à 20 s. Par défaut c'est `tts/ref/default.wav` (voix masculine synthétique). Dépose `tts/ref/custom.wav` (ta propre voix, ou une voix dont tu as les droits) pour l'utiliser à la place.
- **Dynamisme** : `CHATTERBOX.exaggeration` dans `src/constants.ts` (0.5 = neutre, 0.7 = dynamique, 0.9 = très expressif).
- **Prononciation** : `PRONUNCIATION` dans `src/constants.ts` (ex. `GTA` → `G. T. A.`). Ça ne touche que la voix, les sous-titres gardent le vrai texte.
- **Contrôle qualité** : chaque prise est retranscrite par Whisper. Si elle s'éloigne du texte (hallucination, mot avalé, durée anormale), elle est régénérée, avec au maximum `maxTries` prises par scène, et la meilleure est gardée. Les timestamps mot à mot viennent de cette transcription.
- **Une seule scène** : `npm run tts -- --only s3`. Pour obtenir une prise différente, change `CHATTERBOX.seed`.

#### Edge TTS (secours)

Voix Microsoft Edge (`EDGE_VOICE`), via `pip install edge-tts`. ⚠ Ce n'est pas une API officielle : pour un usage commercial, préfère Azure Speech ou ElevenLabs.

## La voix pilote le montage

- `src/constants.ts` : **le fichier unique** des couleurs, marges, du script, des respirations (`leadIn`/`tail`), de la cible de 45 s, des transitions, des réglages ElevenLabs et du mix audio.
- `src/timeline.ts` : durée de chaque scène = durée réelle du MP3 (ffprobe) + respirations. Le temps restant pour atteindre 45 s est réparti selon `tailWeight`.
- Chaque scène (`src/scenes/*.tsx`) ancre ses plans et ses impacts sur des **mots** (`wordFrame(t, 'record')`). Si un plan dépasse ~2,3 s, il est recadré automatiquement (cut « jump zoom »).

## Compositions

- `Main` : le film complet.
- `Scenes/Scene1-Hook` … `Scene7-CTA` : chaque scène isolée, avec sa voix, ses SFX et ses sous-titres.

## Audio

- Voix : une piste par scène.
- Musique : `public/music.mp3`, en boucle. Ducking à -14 dB sous la voix, -6 dB entre les phrases.
- SFX (`public/sfx/`) :
  - `whoosh.mp3` sur les transitions ;
  - `impact.mp3` sur les pops et les secousses ;
  - `chaching.mp3` sur le compteur ;
  - `glitch.mp3` sur les glitchs.
- Un fichier absent est simplement omis : `scripts/scan-assets.ts` tourne avant le studio et le rendu.

## Polices

Anton et Bebas Neue (licence OFL) sont auto-hébergées dans `public/fonts/`, donc le rendu ne dépend pas du réseau.
