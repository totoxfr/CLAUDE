import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {BankCard, Checkout, NeonBill, Stamp} from '../components/Props';
import {Kicker, PopWord, Stage} from '../components/Text';
import {ANTON} from '../components/fonts';
import {COLORS} from '../constants';
import {pop} from '../lib/anim';
import {wordFrame} from '../timeline';
import type {PlanFn} from './types';

// « Et toi dans tout ça ? Tu vas acheter le jeu, et le seul million que tu vas toucher,
//   c'est celui de Vice City ! »
export const plan6: PlanFn = (t) => {
	const B = wordFrame(t, 'tu', 0.25);
	const C = wordFrame(t, 'seul', 0.45);
	const D = wordFrame(t, "c'est", 0.72);
	const vice = wordFrame(t, 'vice', 0.82);
	return {
		impacts: [0, vice + 6],
		chachings: [vice],
		shots: [
			{
				at: 0,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop tint={COLORS.pink} />
						<Stage>
							<div style={{transform: `scale(${1 + f * 0.006})`, display: 'flex', alignItems: 'baseline'}}>
								<PopWord text="ET TOI" frame={f} size={260} color={COLORS.white} tilt={0} />
								<PopWord text="?" frame={f} at={3} size={320} color={COLORS.pink} tilt={12} style={{marginLeft: 20}} />
							</div>
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: B,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.cyan} />
						<Stage>
							<Checkout frame={f} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: C,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.violet} />
						<Stage gap={60}>
							<Kicker text="LE SEUL MILLION QUE TU VAS TOUCHER" frame={f} size={80} color={COLORS.white} />
							<BankCard frame={f} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: D,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop sun grid palms tint={COLORS.cyan} />
						<Stage gap={60}>
							<ViceTitle frame={f} at={vice - D} />
							<div style={{position: 'relative'}}>
								<NeonBill frame={f} />
								<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Stamp text="IN-GAME" frame={f} at={vice - D + 6} size={120} rotate={-14} />
								</div>
							</div>
						</Stage>
					</AbsoluteFill>
				),
			},
		],
	};
};

const ViceTitle: React.FC<{frame: number; at: number}> = ({frame, at}) => {
	const p = pop(frame, at);
	return (
		<div
			style={{
				fontFamily: ANTON,
				fontSize: 200,
				lineHeight: 1,
				background: `linear-gradient(90deg, ${COLORS.pink}, ${COLORS.violet} 50%, ${COLORS.cyan})`,
				WebkitBackgroundClip: 'text',
				color: 'transparent',
				filter: `drop-shadow(0 0 18px ${COLORS.pink}aa)`,
				transform: `scale(${p}) skewX(-8deg)`,
				whiteSpace: 'nowrap',
			}}
		>
			VICE CITY
		</div>
	);
};
