import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, MAX_SHOT_FRAMES, MIN_SHOT_FRAMES} from '../constants';
import {pop, shake} from '../lib/anim';

export type Shot = {
	at: number; // frame locale de début
	render: (f: number, len: number) => React.ReactNode; // f = frame locale au plan
};

type Segment = {shot: Shot; start: number; end: number; subStart: number; variant: number; index: number};

// Découpe : plans ancrés sur la voix + recadrages automatiques si un plan dépasse ~2,3 s.
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
				variant: k,
				index: segs.length,
			});
		}
	});
	return segs;
};

const REFRAME = [
	{s: 1, x: 0, y: 0},
	{s: 1.14, x: 0, y: -40},
	{s: 1.05, x: 0, y: 30},
	{s: 1.1, x: 0, y: 20},
];

/** Rend le plan courant avec un « cut » nerveux (punch-in + flash) et la secousse caméra. */
export const Shots: React.FC<{shots: Shot[]; total: number; impacts?: number[]}> = ({shots, total, impacts = []}) => {
	const frame = useCurrentFrame();
	const segs = segmentsFor(shots, total);
	const seg = [...segs].reverse().find((s) => frame >= s.subStart) ?? segs[0];
	const local = frame - seg.start;
	const sub = frame - seg.subStart;
	const isFirst = seg.index === 0;
	const punch = isFirst ? 1 : 1 + 0.12 * (1 - pop(sub, 0, {damping: 14}));
	const rf = REFRAME[seg.variant % REFRAME.length];
	const drift = 1 + sub * 0.0008;
	const {x, y, r} = shake(frame, impacts);
	const flashColor = [COLORS.white, COLORS.pink, COLORS.cyan][seg.index % 3];
	const flash = isFirst ? 0 : Math.max(0, 0.45 - sub * 0.16);
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					transform: `translate(${x + rf.x}px, ${y + rf.y}px) rotate(${r}deg) scale(${1.04 * punch * rf.s * drift})`,
				}}
			>
				{seg.shot.render(local, seg.end - seg.start)}
			</AbsoluteFill>
			{flash > 0 ? <AbsoluteFill style={{background: flashColor, opacity: flash, mixBlendMode: 'screen'}} /> : null}
		</AbsoluteFill>
	);
};

export const cutsOf = (shots: Shot[], total: number) => segmentsFor(shots, total).map((s) => s.subStart);
