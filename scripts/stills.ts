// Rend des frames clés (hook, chaque transition, mots-clés, CTA) dans out/frames/
// pour contrôle visuel :  node scripts/stills.ts [frame ...]
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {SCENES, TARGET_SECONDS, TRANSITION_FRAMES, VIDEO} from '../src/constants.ts';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'out', 'frames');
fs.mkdirSync(outDir, {recursive: true});
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src', 'voice-manifest.json'), 'utf8'));

// même calcul que src/timeline.ts (version Node)
const fps = VIDEO.fps;
const voices = SCENES.map((s) => manifest.scenes.find((v: {id: string}) => v.id === s.id));
const base = SCENES.map((s, i) => s.leadIn + voices[i].duration + s.tail);
const extra = Math.max(0, TARGET_SECONDS - base.reduce((a, b) => a + b, 0));
const wsum = SCENES.reduce((a, s) => a + s.tailWeight, 0);
let cursor = 0;
const starts = SCENES.map((s, i) => {
	const from = cursor;
	cursor += Math.round((base[i] + (extra * s.tailWeight) / wsum) * fps);
	return from;
});

const named: [string, number][] = [];
const argFrames = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));
if (argFrames.length) argFrames.forEach((f) => named.push([`f${f}`, f]));
else {
	named.push(['hook-00', 2], ['hook-glitch', 5], ['hook-30', 30], ['hook-60', 60], ['hook-90', 90]);
	SCENES.forEach((s, i) => {
		const lead = Math.round(s.leadIn * fps);
		const kw = voices[i].words.map((w: {text: string; start: number}) => [w.text, starts[i] + lead + Math.round(w.start * fps)] as const);
		// mot-clé « fort » de chaque scène + un plan de milieu
		kw.forEach(([text, f]: readonly [string, number]) => {
			if (/millionnaires|attention|take-two|^200|streamers|^jour|exploser|^rp|reconstruire|record|vice|abonne|toi|acheter|seul|crois-moi/i.test(text)) named.push([`s${i + 1}-${text.replace(/[^\p{L}\p{N}]/gu, '')}`, f + 8]);
		});
		if (i > 0) named.push([`trans-${i}to${i + 1}-mid`, starts[i] + Math.floor(TRANSITION_FRAMES / 2)]);
	});
	named.push(['cta-end', cursor - 5]);
}

const serveUrl = await bundle({entryPoint: path.join(root, 'src', 'index.ts')});
const composition = await selectComposition({serveUrl, id: 'Main'});
console.log(`Main : ${composition.durationInFrames} frames (${(composition.durationInFrames / fps).toFixed(2)} s)`);
for (const [name, frame] of named) {
	const f = Math.min(composition.durationInFrames - 1, Math.max(0, frame));
	const output = path.join(outDir, `${String(f).padStart(4, '0')}-${name}.jpg`);
	await renderStill({composition, serveUrl, frame: f, output, imageFormat: 'jpeg', jpegQuality: 80, scale: 0.5});
	console.log(output.replace(root + '/', ''));
}
