import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {BankCard, NeonBill, Stamp} from '../components/Props';
import {Kicker, PopWord, Stage} from '../components/Text';
import {ANTON} from '../components/fonts';
import {COLORS} from '../constants';
import {pop} from '../lib/anim';
import {wordFrame} from '../timeline';
import type {PlanFn} from './types';

// « Et toi ? … Le seul million garanti… c'est celui de Vice City. »
export const plan6: PlanFn = (t) => {
	const B = wordFrame(t, 'le', 0.35);
	const C = wordFrame(t, "c'est", 0.7);
	const D = wordFrame(t, 'vice', 0.82);
	const stampAt = D + 8;
	return {
		impacts: [0, stampAt],
		chachings: [D],
		shots: [
			{
				at: 0,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop tint={COLORS.pink} />
						<Stage>
							<div style={{transform: `scale(${1 + f * 0.004})`, display: 'flex', alignItems: 'baseline'}}>
								<PopWord text="ET TOI" frame={f} size={250} color={COLORS.white} tilt={0} />
								<PopWord text="?" frame={f} at={4} size={300} color={COLORS.pink} tilt={10} style={{marginLeft: 20}} />
							</div>
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: B,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.violet} />
						<Stage gap={70}>
							<Kicker text="LE SEUL MILLION GARANTI…" frame={f} size={84} color={COLORS.white} />
							<BankCard frame={f} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: C,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop sun grid palms tint={COLORS.pink} />
						<Stage gap={10}>
							<Kicker text="C'EST CELUI DE…" frame={f} size={100} color={COLORS.white} />
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
							<ViceTitle frame={f} />
							<div style={{position: 'relative'}}>
								<NeonBill frame={f} />
								<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Stamp text="IN-GAME" frame={f} at={8} size={120} rotate={-14} />
								</div>
							</div>
						</Stage>
					</AbsoluteFill>
				),
			},
		],
	};
};

const ViceTitle: React.FC<{frame: number}> = ({frame}) => {
	const p = pop(frame, 0);
	return (
		<div
			style={{
				fontFamily: ANTON,
				fontSize: 190,
				lineHeight: 1,
				background: `linear-gradient(90deg, ${COLORS.pink}, ${COLORS.violet} 50%, ${COLORS.cyan})`,
				WebkitBackgroundClip: 'text',
				color: 'transparent',
				filter: `drop-shadow(0 0 18px ${COLORS.pink}aa)`,
				transform: `scale(${p}) skewX(-8deg)`,
				whiteSpace: 'nowrap',
				textShadow: 'none',
			}}
		>
			VICE CITY
		</div>
	);
};
