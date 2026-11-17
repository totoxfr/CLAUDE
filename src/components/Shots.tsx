import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, MAX_SHOT_FRAMES, MIN_SHOT_FRAMES, VIDEO} from '../constants';
import {pop, shake} from '../lib/anim';

export type Shot = {
	at: number; // frame locale de début
	render: (f: number, len: number) => React.ReactNode; // f = frame locale au plan
};

type Segment = {shot: Shot; start: number; end: number; subStart: number; subEnd: number; variant: number; index: number};

// Découpe : plans ancrés sur la voix + recadrages automatiques si un plan dépasse MAX_SHOT_FRAMES.
const segmentsFor = (shots: Shot[], total: number): Segment[] => {
	const sorted = [...shots].sort((a, b) => a.at - b.at);
	const kept: Shot[] = [];
	for (const s of sorted) {
		const at = Math.max(0, s.at);
		if (kept.length && at - kept[kept.length - 1].at < MIN_SHOT_FRAMES) continue;
		kept.push({...s, at: kept.length ? at : 0});
	}
	const segs: Segment[] = [];
	kept.forEach((shot, i) => {
		const start = shot.at;
		const end = i + 1 < kept.length ? kept[i + 1].at : total;
		const n = Math.max(1, Math.ceil((end - start) / MAX_SHOT_FRAMES));
		for (let k = 0; k < n; k++) {
			segs.push({
				shot,
				start,
				end,
				subStart: Math.round(start + ((end - start) * k) / n),
				subEnd: Math.round(start + ((end - start) * (k + 1)) / n),
				variant: k,
				index: segs.length,
			});
		}
	});
	return segs;
};

// Recadrages pour les plans découpés automatiquement (jump cuts)
const REFRAME = [
	{s: 1, y: 0, r: 0},
	{s: 1.16, y: -50, r: -1.5},
	{s: 1.08, y: 40, r: 1.2},
	{s: 1.2, y: 10, r: 0},
];

type CutStyle = 'punch' | 'zoomOut' | 'tilt' | 'slideUp';
const CUTS: CutStyle[] = ['punch', 'slideUp', 'zoomOut', 'tilt'];

const cutIn = (style: CutStyle, f: number) => {
	const p = pop(f, 0, {damping: 13, stiffness: 210});
	switch (style) {
		case 'punch':
			return {s: 1 + 0.22 * (1 - p), x: 0, y: 0, r: 0};
		case 'zoomOut':
			return {s: 1 - 0.18 * (1 - p), x: 0, y: 0, r: 0};
		case 'tilt':
			return {s: 1 + 0.1 * (1 - p), x: 0, y: 0, r: -7 * (1 - p)};
		case 'slideUp':
			return {s: 1, x: 0, y: 260 * (1 - p), r: 0};
	}
};

/**
 * Rend le plan courant avec :
 * - un cut nerveux (style qui tourne) + flash,
 * - une pulsation sur chaque mot prononcé (la caméra « respire » avec la voix),
 * - une sortie (zoom + flou) juste avant le cut suivant,
 * - secousse + flash + lignes de vitesse sur les impacts.
 */
export const Shots: React.FC<{shots: Shot[]; total: number; impacts?: number[]; beats?: number[]}> = ({
	shots,
	total,
	impacts = [],
	beats = [],
}) => {
	const frame = useCurrentFrame();
	const segs = segmentsFor(shots, total);
	const seg = [...segs].reverse().find((s) => frame >= s.subStart) ?? segs[0];
	const local = frame - seg.start;
	const sub = frame - seg.subStart;
	const isFirst = seg.index === 0;
	const cut = isFirst ? {s: 1, x: 0, y: 0, r: 0} : cutIn(CUTS[seg.index % CUTS.length], sub);
	const rf = REFRAME[seg.variant % REFRAME.length];
	const drift = 1 + sub * 0.0018;
	// pulsation voix
	let pulse = 0;
	for (const b of beats) {
		const t = frame - b;
		if (t >= 0 && t < 7) pulse += 0.028 * (1 - t / 7);
	}
	// sortie de plan (3 dernières frames), sauf fin de scène (gérée par la transition)
	const toEnd = seg.subEnd - frame;
	const exiting = seg.subEnd < total - 2 && toEnd <= 3;
	const exitS = exiting ? 1 + (4 - toEnd) * 0.05 : 1;
	const exitBlur = exiting ? (4 - toEnd) * 2.5 : 0;
	const {x, y, r} = shake(frame, impacts, 26);
	const flashColor = [COLORS.white, COLORS.pink, COLORS.cyan][seg.index % 3];
	const flash = isFirst ? 0 : Math.max(0, 0.5 - sub * 0.18);
	return (
		<AbsoluteFill style={{overflow: 'hidden', background: COLORS.night}}>
			<AbsoluteFill
				style={{
					transform: `translate(${x + cut.x}px, ${y + rf.y + cut.y}px) rotate(${r + rf.r + cut.r}deg) scale(${
						1.05 * cut.s * rf.s * drift * (1 + pulse) * exitS
					})`,
					filter: exitBlur ? `blur(${exitBlur}px)` : undefined,
				}}
			>
				{seg.shot.render(local, seg.end - seg.start)}
			</AbsoluteFill>
			{flash > 0 ? <AbsoluteFill style={{background: flashColor, opacity: flash, mixBlendMode: 'screen'}} /> : null}
			<ImpactFX frame={frame} impacts={impacts} />
		</AbsoluteFill>
	);
};

/** Flash radial + lignes de vitesse + liseré RGB sur chaque impact. */
const ImpactFX: React.FC<{frame: number; impacts: number[]}> = ({frame, impacts}) => {
	const last = impacts.filter((i) => frame >= i && frame - i < 10).pop();
	if (last === undefined) return null;
	const t = frame - last;
	const o = interpolate(t, [0, 10], [1, 0]);
	const cx = VIDEO.width / 2;
	const cy = 760;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, ${COLORS.white}${t < 2 ? '88' : '33'} 0%, transparent 45%)`, opacity: o, mixBlendMode: 'screen'}} />
			<svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', opacity: o}}>
				{new Array(28).fill(0).map((_, i) => {
					const a = (i / 28) * Math.PI * 2 + last;
					const r1 = 380 + t * 40;
					const r2 = r1 + 260 + (i % 3) * 120;
					return (
						<line
							key={i}
							x1={cx + Math.cos(a) * r1}
							y1={cy + Math.sin(a) * r1}
							x2={cx + Math.cos(a) * r2}
							y2={cy + Math.sin(a) * r2}
							stroke={i % 2 ? COLORS.cyan : COLORS.pink}
							strokeWidth={i % 3 === 0 ? 8 : 4}
							strokeLinecap="round"
						/>
					);
				})}
			</svg>
			<AbsoluteFill style={{boxShadow: `inset 12px 0 0 ${COLORS.cyan}88, inset -12px 0 0 ${COLORS.pink}88`, opacity: o}} />
		</AbsoluteFill>
	);
};

export const cutsOf = (shots: Shot[], total: number) => segmentsFor(shots, total).map((s) => s.subStart);
