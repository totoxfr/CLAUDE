import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {Countdown, MoneyCounter, MoneyRain} from '../components/Props';
import {Kicker, PopWord, Stage, glow} from '../components/Text';
import {ANTON} from '../components/fonts';
import {COLORS} from '../constants';
import {float, pop} from '../lib/anim';
import {wordFrame} from '../timeline';
import type {PlanFn} from './types';

// « GTA 6 sort dans deux jours. Et crois-moi, il va créer des millionnaires ! »
export const plan1: PlanFn = (t) => {
	const B = wordFrame(t, 'dans', 0.25);
	const deux = wordFrame(t, 'deux', 0.28);
	const C = wordFrame(t, 'crois-moi', 0.5);
	const D = wordFrame(t, 'il', 0.62);
	const E = wordFrame(t, 'millionnaires', 0.82);
	return {
		impacts: [0, deux, C, E],
		chachings: [D + Math.round((E - D) * 0.5), E],
		shots: [
			{
				at: 0,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop sun grid palms />
						<Stage>
							<ChromaTitle text="GTA 6" frame={f} />
							<Kicker text="SORTIE LE 19 NOVEMBRE" frame={f} at={6} size={74} color={COLORS.white} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: B,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.cyan} />
						<Stage gap={0}>
							<Countdown frame={f} />
							<PopWord text="J-2" frame={f} at={deux - B} size={360} color={COLORS.pink} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: C,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.violet} />
						<Stage>
							<PopWord text="CROIS-MOI" frame={f} size={200} color={COLORS.white} tilt={-6} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: D,
				render: (f, len) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.cyan} />
						<Stage gap={20}>
							<div style={{transform: `scale(${0.6 + 0.5 * pop(f, 0)})`}}>
								<MoneyCounter frame={f} to={999999} start={0} end={len + 2} size={170} />
							</div>
							<DollarRow frame={f} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: E,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop sun grid palms tint={COLORS.pink} />
						<MoneyRain frame={f} seed="s1" count={22} />
						<Stage gap={20}>
							<MoneyCounter frame={f} from={999999} to={1000000} start={0} end={3} size={120} />
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
	const split = 18 * (1 - p) + 5 + Math.abs(float(frame, 4, 0.9));
	const base: React.CSSProperties = {fontFamily: ANTON, fontSize: 400, lineHeight: 1, position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap'};
	return (
		<div style={{position: 'relative', display: 'flex', justifyContent: 'center', transform: `scale(${0.3 + 0.7 * p}) rotate(${(1 - p) * -12}deg)`}}>
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
			const p = pop(frame, 2 + i * 3);
			return (
				<div key={i} style={{fontFamily: ANTON, fontSize: 120, color: i % 2 ? COLORS.cyan : COLORS.pink, textShadow: glow(i % 2 ? COLORS.cyan : COLORS.pink, 0.6), transform: `translateY(${(1 - p) * 140 + float(frame, 14, 0.35, i)}px) scale(${p})`}}>
					$
				</div>
			);
		})}
	</div>
);
