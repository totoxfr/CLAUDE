import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';
import assets from './assets-manifest.json';
import {ASSETS, AUDIO, TRANSITION_FRAMES} from './constants';
import {PLANS} from './scenes';
import {TIMELINE, TOTAL_FRAMES, type SceneTiming} from './timeline';

const gain = (db: number) => Math.pow(10, db / 20);

type Sfx = keyof typeof ASSETS.sfx;
type Cue = {at: number; kind: Sfx};

/** Liste des SFX (frames globales). */
export const sfxCues = (scenes: SceneTiming[]): Cue[] => {
	const cues: Cue[] = [];
	scenes.forEach((t, i) => {
		const plan = PLANS[t.index](t);
		plan.impacts.forEach((f) => cues.push({at: t.from + f, kind: 'impact'}));
		plan.chachings.forEach((f) => cues.push({at: t.from + f, kind: 'chaching'}));
		const enter = i === 0 ? (t.index === 0 ? 'glitch' : 'none') : scenes[i - 1].def.transitionOut;
		if (enter === 'glitch' || enter === 'glitchLight') cues.push({at: t.from, kind: 'glitch'});
		else if (enter !== 'none') cues.push({at: Math.max(0, t.from - AUDIO.whooshLeadFrames), kind: 'whoosh'});
	});
	// pas deux impacts empilés à < 3 frames
	return cues
		.sort((a, b) => a.at - b.at)
		.filter((c, i, arr) => !arr.slice(0, i).some((o) => o.kind === c.kind && c.at - o.at < 3));
};

/** Courbe de ducking : -14 dB sous la voix, -6 dB entre les phrases. */
const musicCurve = (scenes: SceneTiming[], total: number): number[] => {
	const active = new Array(total).fill(false);
	for (const t of scenes)
		for (const w of t.words)
			for (let f = t.from + w.start - AUDIO.duckAttackFrames; f < t.from + w.end; f++) if (f >= 0 && f < total) active[f] = true;
	// comble les micro-silences
	let last = -1e9;
	for (let f = 0; f < total; f++) {
		if (active[f]) {
			if (f - last > 1 && f - last <= AUDIO.duckHoldFrames) for (let k = last + 1; k < f; k++) active[k] = true;
			last = f;
		}
	}
	const db: number[] = [];
	let cur: number = AUDIO.musicBetweenDb;
	const down = (AUDIO.musicBetweenDb - AUDIO.musicUnderVoiceDb) / AUDIO.duckAttackFrames;
	const up = (AUDIO.musicBetweenDb - AUDIO.musicUnderVoiceDb) / AUDIO.duckReleaseFrames;
	for (let f = 0; f < total; f++) {
		const target = active[f] ? AUDIO.musicUnderVoiceDb : AUDIO.musicBetweenDb;
		cur = target < cur ? Math.max(target, cur - down) : Math.min(target, cur + up);
		const fade = Math.min(1, f / AUDIO.musicFadeInFrames, (total - f) / AUDIO.musicFadeOutFrames);
		db.push(gain(cur) * Math.max(0, fade));
	}
	return db;
};

export const Soundtrack: React.FC<{scenes?: SceneTiming[]; total?: number; music?: boolean}> = ({
	scenes = TIMELINE,
	total = TOTAL_FRAMES,
	music = true,
}) => {
	const curve = React.useMemo(() => musicCurve(scenes, total), [scenes, total]);
	const cues = React.useMemo(() => sfxCues(scenes), [scenes]);
	const base = scenes[0]?.from ?? 0;
	return (
		<>
			{scenes.map((t) => (
				<Sequence key={t.def.id} from={t.from - base + t.voiceFrom} durationInFrames={t.voiceFrames + TRANSITION_FRAMES} layout="none">
					<Html5Audio src={staticFile(t.voiceFile)} volume={gain(AUDIO.voiceDb)} />
				</Sequence>
			))}
			{music && assets.music ? (
				<Html5Audio src={staticFile(ASSETS.music)} loop volume={(f) => curve[Math.min(curve.length - 1, f)] ?? 0} />
			) : null}
			{cues
				.filter((c) => (assets.sfx as Record<string, boolean>)[c.kind])
				.map((c, i) => (
					<Sequence key={i} from={c.at - base} durationInFrames={30} layout="none">
						<Html5Audio src={staticFile(ASSETS.sfx[c.kind])} volume={gain(AUDIO.sfxDb[c.kind])} />
					</Sequence>
				))}
		</>
	);
};
