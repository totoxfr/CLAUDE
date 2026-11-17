# GTA 6 va créer des millionnaires — motion design vertical

Remotion (React + TypeScript), 1080×1920, 30 fps, ~45 s.

## Démarrage

```bash
npm install
cp .env.example .env        # puis renseigne ELEVENLABS_API_KEY (et éventuellement ELEVENLABS_VOICE_ID)
npm run tts                 # génère public/voice/s1..s7.mp3 + src/voice-manifest.json (timestamps mot à mot)
npm run sfx                 # SFX de secours synthétisés (n'écrase pas les tiens)
npm run studio              # preview
npm run stills              # frames clés -> out/frames/ (contrôle visuel)
npm run render              # -> out/gta6-millionnaires.mp4 (H.264, CRF 18)
```

`npm run tts -- --only s3` régénère une seule scène.

Sans clé, `npm run tts` crée des pistes **muettes** avec un timing estimé, pour pouvoir monter et prévisualiser.

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
