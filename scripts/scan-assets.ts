// Détecte la musique et les SFX présents dans /public pour que le rendu
// ne casse pas si un fichier manque (les pistes absentes sont simplement omises).
import fs from 'node:fs';
import path from 'node:path';
import {ASSETS} from '../src/constants.ts';

const root = path.resolve(import.meta.dirname, '..');
const has = (p: string) => fs.existsSync(path.join(root, 'public', p));
const out = {
	music: has(ASSETS.music),
	sfx: Object.fromEntries(Object.entries(ASSETS.sfx).map(([k, p]) => [k, has(p)])),
};
fs.writeFileSync(path.join(root, 'src', 'assets-manifest.json'), JSON.stringify(out, null, '\t') + '\n');
if (!out.music) console.warn('⚠ public/music.mp3 absent : rendu sans musique (emplacement prévu).');
for (const [k, v] of Object.entries(out.sfx)) if (!v) console.warn(`⚠ public/${ASSETS.sfx[k as keyof typeof ASSETS.sfx]} absent`);
