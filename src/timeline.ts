// Calcule le montage à partir des durées RÉELLES des pistes voix.
import manifest from './voice-manifest.json';
import {SCENES, TARGET_SECONDS, VIDEO, type SceneDef} from './constants';

export type FWord = {text: string; start: number; end: number}; // en frames
export type SceneTiming = {
	def: SceneDef;
	index: number;
	from: number; // frame globale de début
	duration: number; // frames
	voiceFrom: number; // frame locale où démarre la piste voix
	voiceFile: string;
	voiceFrames: number;
	words: FWord[]; // frames LOCALES à la scène
};

const fps = VIDEO.fps;

const voices = SCENES.map((s) => {
	const v = manifest.scenes.find((x) => x.id === s.id);
	if (!v) throw new Error(`Voix manquante pour ${s.id} : lance « npm run tts ».`);
	return v;
});

const base = SCENES.map((s, i) => s.leadIn + voices[i].duration + s.tail);
const extra = Math.max(0, TARGET_SECONDS - base.reduce((a, b) => a + b, 0));
const weightSum = SCENES.reduce((a, s) => a + s.tailWeight, 0);

let cursor = 0;
export const TIMELINE: SceneTiming[] = SCENES.map((def, index) => {
	const v = voices[index];
	const voiceFrom = Math.round(def.leadIn * fps);
	const duration = Math.round((base[index] + (extra * def.tailWeight) / weightSum) * fps);
	const t: SceneTiming = {
		def,
		index,
		from: cursor,
		duration,
		voiceFrom,
		voiceFile: v.file,
		voiceFrames: Math.ceil(v.duration * fps),
		words: v.words.map((w) => ({
			text: w.text,
			start: voiceFrom + Math.round(w.start * fps),
			end: voiceFrom + Math.round(w.end * fps),
		})),
	};
	cursor += duration;
	return t;
});

export const TOTAL_FRAMES = cursor;
export const IS_PLACEHOLDER_VOICE = manifest.placeholder;

const norm = (s: string) =>
	s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]/g, '');

/** Frame locale du début du mot (n-ième occurrence), ou repli en fraction de la voix. */
export const wordFrame = (t: SceneTiming, word: string, fallbackFrac = 0.5, occurrence = 0): number => {
	const target = norm(word);
	const exact = t.words.filter((w) => norm(w.text) === target);
	const hits = exact.length ? exact : t.words.filter((w) => norm(w.text).startsWith(target));
	const hit = hits[occurrence];
	return hit ? hit.start : Math.round(t.voiceFrom + t.voiceFrames * fallbackFrac);
};

export const wordEnd = (t: SceneTiming, word: string, fallbackFrac = 0.5): number => {
	const target = norm(word);
	const hit = t.words.find((w) => norm(w.text) === target || norm(w.text).startsWith(target));
	return hit ? hit.end : Math.round(t.voiceFrom + t.voiceFrames * fallbackFrac);
};

export const lastWordEnd = (t: SceneTiming) => t.words[t.words.length - 1]?.end ?? t.voiceFrom + t.voiceFrames;
