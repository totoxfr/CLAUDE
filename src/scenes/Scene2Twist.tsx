import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {WarningSign} from '../components/Props';
import {PopWord, Stage, glow} from '../components/Text';
import {ANTON} from '../components/fonts';
import {COLORS} from '../constants';
import {easeRamp, pop} from '../lib/anim';
import {wordEnd, wordFrame} from '../timeline';
import type {PlanFn} from './types';

// « Mais attention : pas ceux que tu crois. »
export const plan2: PlanFn = (t) => {
	const att = wordFrame(t, 'attention', 0.12);
	const B = wordFrame(t, 'pas', 0.5);
	const strike = wordEnd(t, 'crois', 0.95);
	return {
		impacts: [att, strike],
		chachings: [],
		shots: [
			{
				at: 0,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop tint={COLORS.pink} />
						<Stage gap={30}>
							<WarningSign frame={f} />
							<PopWord text="ATTENTION" frame={f} at={att} size={190} color={COLORS.pink} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: B,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.violet} />
						<Stage gap={0}>
							<DropWords words={['PAS', 'CEUX']} frame={f} size={230} />
							<div style={{position: 'relative'}}>
								<DropWords words={['QUE', 'TU', 'CROIS']} frame={f} at={6} size={150} />
								<div
									style={{
										position: 'absolute',
										left: -30,
										right: -30,
										top: '46%',
										height: 24,
										borderRadius: 12,
										background: COLORS.pink,
										boxShadow: glow(COLORS.pink),
										transformOrigin: '0 50%',
										transform: `scaleX(${easeRamp(f, strike - B - 3, strike - B + 3)}) rotate(-5deg)`,
									}}
								/>
							</div>
						</Stage>
					</AbsoluteFill>
				),
			},
		],
	};
};

const DropWords: React.FC<{words: string[]; frame: number; at?: number; size: number}> = ({words, frame, at = 0, size}) => (
	<div style={{display: 'flex', gap: size * 0.25, fontFamily: ANTON, fontSize: size, lineHeight: 1.05, color: COLORS.white, textShadow: glow(COLORS.violet, 0.7)}}>
		{words.map((w, i) => {
			const p = pop(frame, at + i * 3, {damping: 10, stiffness: 220});
			return (
				<span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - p) * -300}px) rotate(${(1 - p) * (i % 2 ? 30 : -30)}deg)`, opacity: Math.min(1, p * 2)}}>
					{w}
				</span>
			);
		})}
	</div>
);
