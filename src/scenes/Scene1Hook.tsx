import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {MoneyCounter, MoneyRain, Countdown} from '../components/Props';
import {Kicker, PopWord, Stage, glow} from '../components/Text';
import {ANTON} from '../components/fonts';
import {COLORS} from '../constants';
import {pop, float} from '../lib/anim';
import {wordFrame} from '../timeline';
import type {PlanFn} from './types';

// HOOK : « GTA 6 sort dans deux jours… et il va créer des millionnaires. »
export const plan1: PlanFn = (t) => {
	const B = wordFrame(t, 'deux', 0.3);
	const C = wordFrame(t, 'et', 0.55);
	const D = wordFrame(t, 'millionnaires', 0.85);
	const counterLen = D - C;
	return {
		impacts: [B, D],
		chachings: [C + Math.round(counterLen * 0.55), D],
		shots: [
			{
				at: 0,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop sun grid palms />
						<Stage>
							<ChromaTitle text="GTA 6" frame={f} />
							<Kicker text="19 NOVEMBRE 2026" frame={f} at={5} size={80} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: B,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.cyan} />
						<Stage gap={10}>
							<Kicker text="SORTIE DANS" frame={f} size={80} color={COLORS.white} />
							<Countdown frame={f} />
							<PopWord text="J-2" frame={f} at={3} size={300} color={COLORS.pink} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: C,
				render: (f, len) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.violet} />
						<Stage gap={20}>
							<Kicker text="IL VA CRÉER DES…" frame={f} size={84} color={COLORS.white} />
							<div style={{transform: `scale(${0.6 + 0.4 * pop(f, 0)})`}}>
								<MoneyCounter frame={f} to={999999} start={0} end={len + 4} size={160} />
							</div>
							<DollarRow frame={f} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: D,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop sun grid palms tint={COLORS.pink} />
						<MoneyRain frame={f} seed="s1" />
						<Stage gap={30}>
							<MoneyCounter frame={f} from={999999} to={1000000} start={0} end={4} size={110} />
							<PopWord text="MILLIONNAIRES" frame={f} size={150} color={COLORS.pink} />
						</Stage>
					</AbsoluteFill>
				),
			},
		],
	};
};

const ChromaTitle: React.FC<{text: string; frame: number}> = ({text, frame}) => {
	const p = pop(frame, 0);
	const split = 14 * (1 - p) + 4 + Math.abs(float(frame, 3, 0.9));
	const base: React.CSSProperties = {fontFamily: ANTON, fontSize: 380, lineHeight: 1, position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap'};
	return (
		<div style={{position: 'relative', width: 760, height: 400, display: 'flex', justifyContent: 'center', transform: `scale(${0.4 + 0.6 * p})`}}>
			<div style={{position: 'relative'}}>
				<div style={{...base, position: 'relative', visibility: 'hidden'}}>{text}</div>
				<div style={{...base, color: COLORS.cyan, transform: `translateX(${-split}px)`, mixBlendMode: 'screen', opacity: 0.9}}>{text}</div>
				<div style={{...base, color: COLORS.pink, transform: `translateX(${split}px)`, mixBlendMode: 'screen', opacity: 0.9}}>{text}</div>
				<div style={{...base, color: COLORS.white, textShadow: glow(COLORS.violet, 0.6)}}>{text}</div>
			</div>
		</div>
	);
};

const DollarRow: React.FC<{frame: number}> = ({frame}) => (
	<div style={{display: 'flex', gap: 30}}>
		{[0, 1, 2, 3, 4].map((i) => {
			const p = pop(frame, 4 + i * 4);
			return (
				<div key={i} style={{fontFamily: ANTON, fontSize: 110, color: i % 2 ? COLORS.cyan : COLORS.pink, textShadow: glow(i % 2 ? COLORS.cyan : COLORS.pink, 0.6), transform: `translateY(${(1 - p) * 120 + float(frame, 10, 0.25, i)}px) scale(${p})`}}>
					$
				</div>
			);
		})}
	</div>
);
