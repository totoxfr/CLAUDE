import React from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS, SAFE, SUBS, VIDEO} from '../constants';
import {pop} from '../lib/anim';
import type {FWord} from '../timeline';
import {ANTON} from './fonts';

type Group = {words: FWord[]; start: number; end: number};

const clean = (s: string) => s.replace(/[.,:;…«»"]/g, '').replace(/\s*\?/, ' ?').toUpperCase().trim();

export const groupWords = (words: FWord[]): Group[] => {
	const gap = SUBS.breakGapSeconds * VIDEO.fps;
	// 1) découpe en phrases (ponctuation ou silence)
	const phrases: FWord[][] = [];
	let cur: FWord[] = [];
	words.forEach((w, i) => {
		const prev = words[i - 1];
		if (cur.length && prev && w.start - prev.end > gap) {
			phrases.push(cur);
			cur = [];
		}
		cur.push(w);
		if (/[.?!…:]$/.test(w.text)) {
			phrases.push(cur);
			cur = [];
		}
	});
	if (cur.length) phrases.push(cur);
	// 2) chaque phrase -> blocs équilibrés de 2 à 4 mots (5 mots = 3 + 2, jamais de mot orphelin)
	const groups: Group[] = [];
	for (const ph of phrases) {
		const k = Math.ceil(ph.length / SUBS.maxWords);
		let idx = 0;
		for (let c = 0; c < k; c++) {
			const size = Math.ceil((ph.length - idx) / (k - c));
			const ws = ph.slice(idx, idx + size);
			idx += size;
			groups.push({words: ws, start: ws[0].start, end: ws[ws.length - 1].end});
		}
	}
	// étend chaque groupe jusqu'au suivant (pas de trou visuel quand le débit est continu)
	return groups.map((g, i) => {
		const next = groups[i + 1];
		const hold = Math.round(VIDEO.fps * 0.35);
		const end = next && next.start - g.end < VIDEO.fps * 0.6 ? next.start : g.end + hold;
		return {...g, end};
	});
};

const fontSizeFor = (g: Group) => {
	const chars = g.words.reduce((a, w) => a + clean(w.text).length, 0) + g.words.length - 1;
	const width = VIDEO.width - SAFE.left - SAFE.right;
	// Anton majuscule ≈ 0,46 em par caractère ; on autorise 2 lignes au besoin
	const oneLine = width / (chars * 0.46);
	return Math.round(Math.max(SUBS.minFontSize, Math.min(SUBS.maxFontSize, oneLine * 1.0)));
};

/** Sous-titres façon TikTok : 2-4 mots, mot prononcé en rose. `words` en frames du conteneur. */
export const Subtitles: React.FC<{words: FWord[]}> = ({words}) => {
	const frame = useCurrentFrame();
	const groups = React.useMemo(() => groupWords(words), [words]);
	const g = groups.find((x) => frame >= x.start && frame < x.end);
	if (!g) return null;
	const p = pop(frame, g.start, {damping: 14, stiffness: 220});
	const size = fontSizeFor(g);
	return (
		<div
			style={{
				position: 'absolute',
				left: SAFE.left,
				right: SAFE.right,
				top: SUBS.centerY - 160,
				height: 320,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				pointerEvents: 'none',
			}}
		>
			<div
				style={{
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'center',
					columnGap: size * 0.3,
					rowGap: 0,
					fontFamily: ANTON,
					fontSize: size,
					lineHeight: 1.08,
					transform: `scale(${0.85 + 0.15 * p}) translateY(${(1 - p) * 30}px)`,
					opacity: Math.min(1, p * 2.5),
				}}
			>
				{g.words.map((w, i) => {
					const next = g.words[i + 1];
					const active = frame >= w.start && (next ? frame < next.start : true);
					const wp = active ? pop(frame, w.start, {damping: 10, stiffness: 260}) : 0;
					return (
						<span
							key={i}
							style={{
								color: active ? COLORS.pink : COLORS.white,
								WebkitTextStroke: `${Math.round(size * 0.09)}px ${COLORS.night}`,
								paintOrder: 'stroke fill',
								textShadow: active
									? `0 0 18px ${COLORS.pink}, 0 6px 0 ${COLORS.night}`
									: `0 6px 0 ${COLORS.night}, 0 0 20px #000`,
								display: 'inline-block',
								transform: `scale(${1 + 0.05 * wp})`,
								transformOrigin: '50% 60%',
							}}
						>
							{clean(w.text)}
						</span>
					);
				})}
			</div>
		</div>
	);
};
