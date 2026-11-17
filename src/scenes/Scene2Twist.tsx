import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {Kicker, Stage, glow} from '../components/Text';
import {ANTON} from '../components/fonts';
import {COLORS} from '../constants';
import {easeRamp, pop, float} from '../lib/anim';
import {lastWordEnd, wordEnd, wordFrame} from '../timeline';
import type {PlanFn} from './types';

// « Mais pas ceux que tu crois. »
export const plan2: PlanFn = (t) => {
	const B = wordFrame(t, 'que', 0.5);
	const strike = wordEnd(t, 'crois', 0.95);
	const C = lastWordEnd(t) + 10;
	return {
		impacts: [wordFrame(t, 'pas', 0.2), strike],
		chachings: [],
		shots: [
			{
				at: 0,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop tint={COLORS.violet} />
						<Stage gap={50}>
							<CrackedCounter frame={f} />
							<DropLetters text="MAIS PAS" frame={f} size={190} />
							<DropLetters text="CEUX" frame={f} at={6} size={260} color={COLORS.white} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: B,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.pink} />
						<Stage>
							<div style={{position: 'relative'}}>
								<DropLetters text="QUE TU CROIS" frame={f} size={150} />
								<div
									style={{
										position: 'absolute',
										left: -20,
										right: -20,
										top: '48%',
										height: 22,
										borderRadius: 11,
										background: COLORS.pink,
										boxShadow: glow(COLORS.pink),
										transformOrigin: '0 50%',
										transform: `scaleX(${easeRamp(f, strike - B - 4, strike - B + 4)}) rotate(-4deg)`,
									}}
								/>
							</div>
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: C,
				render: (f) => {
					const on = Math.floor(f / 3) % 7 !== 0;
					return (
						<AbsoluteFill>
							<Backdrop grid tint={COLORS.cyan} />
							<Stage gap={0}>
								<div style={{fontFamily: ANTON, fontSize: 620, lineHeight: 1, color: COLORS.cyan, opacity: on ? 1 : 0.35, textShadow: glow(COLORS.cyan, 1.5), transform: `scale(${pop(f, 0)}) rotate(${float(f, 5, 0.12)}deg)`}}>?</div>
								<Kicker text="ALORS, QUI ?" frame={f} at={4} size={96} color={COLORS.white} />
							</Stage>
						</AbsoluteFill>
					);
				},
			},
		],
	};
};

const DropLetters: React.FC<{text: string; frame: number; at?: number; size: number; color?: string}> = ({text, frame, at = 0, size, color = COLORS.white}) => (
	<div style={{display: 'flex', fontFamily: ANTON, fontSize: size, lineHeight: 1, color, textShadow: glow(COLORS.violet, 0.7)}}>
		{text.split('').map((ch, i) => {
			const p = pop(frame, at + i * 1.5);
			return (
				<span key={i} style={{display: 'inline-block', whiteSpace: 'pre', transform: `translateY(${(1 - p) * -260}px) rotate(${(1 - p) * (i % 2 ? 25 : -25)}deg)`, opacity: Math.min(1, p * 2)}}>
					{ch}
				</span>
			);
		})}
	</div>
);

const CrackedCounter: React.FC<{frame: number}> = ({frame}) => {
	const crack = easeRamp(frame, 4, 14);
	return (
		<div style={{position: 'relative', opacity: 0.85}}>
			<div style={{fontFamily: ANTON, fontSize: 120, color: COLORS.dim, textShadow: glow(COLORS.cyan, 0.3), whiteSpace: 'nowrap', filter: 'grayscale(0.6)'}}>999 999 $</div>
			<svg width={620} height={160} style={{position: 'absolute', left: 0, top: 0}} viewBox="0 0 620 160">
				<path d="M300 0 L 280 50 L 330 80 L 290 120 L 320 160 M 280 50 L 200 70 M 330 80 L 430 60 L 470 90" fill="none" stroke={COLORS.white} strokeWidth={5} strokeDasharray={700} strokeDashoffset={700 * (1 - crack)} />
			</svg>
		</div>
	);
};
