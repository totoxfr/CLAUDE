import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {CopiesStack, RisingChart, Stamp, UpArrow} from '../components/Props';
import {Kicker, PopWord, RankBadge, Stage, glow} from '../components/Text';
import {ANTON} from '../components/fonts';
import {COLORS} from '../constants';
import {easeRamp, fmtInt} from '../lib/anim';
import {wordFrame} from '../timeline';
import type {PlanFn} from './types';

// « Gagnant numéro un : Take-Two, l'éditeur. GTA 5, c'est plus de 200 millions de copies vendues.
//   Alors pour le 6, ils visent une année record. »
export const plan3: PlanFn = (t) => {
	const B = wordFrame(t, 'take-two', 0.15);
	const edit = wordFrame(t, "l'éditeur", 0.25);
	const C = wordFrame(t, 'gta', 0.35);
	const D = wordFrame(t, '200', 0.5);
	const E = wordFrame(t, 'alors', 0.7);
	const F = wordFrame(t, 'record', 0.92);
	return {
		impacts: [B, D, F],
		chachings: [D],
		shots: [
			{
				at: 0,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.cyan} />
						<Stage>
							<RankBadge n={1} label="GAGNANT N°1" frame={f} color={COLORS.cyan} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: B,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop sun grid tint={COLORS.cyan} />
						<Stage gap={20}>
							<PopWord text="TAKE-TWO" frame={f} size={220} color={COLORS.cyan} />
							<Kicker text="L'ÉDITEUR" frame={f} at={edit - B} size={100} color={COLORS.white} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: C,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.violet} />
						<Stage gap={40}>
							<PopWord text="GTA 5" frame={f} size={200} color={COLORS.white} tilt={0} />
							<CopiesStack frame={f} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: D,
				render: (f) => {
					const v = 200000000 * easeRamp(f, 0, 20);
					return (
						<AbsoluteFill>
							<Backdrop grid tint={COLORS.pink} />
							<Stage gap={10}>
								<Kicker text="PLUS DE" frame={f} size={90} color={COLORS.white} />
								<div style={{fontFamily: ANTON, fontSize: 170, color: COLORS.white, textShadow: glow(COLORS.pink), fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{fmtInt(v)}</div>
								<Kicker text="COPIES VENDUES" frame={f} at={8} size={100} color={COLORS.cyan} />
							</Stage>
						</AbsoluteFill>
					);
				},
			},
			{
				at: E,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.violet} />
						<Stage gap={30}>
							<Kicker text="ET POUR LE 6 ?" frame={f} size={100} color={COLORS.white} />
							<RisingChart frame={f} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: F,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.pink} />
						<Stage gap={0}>
							<div style={{position: 'relative'}}>
								<RisingChart frame={f + 60} highlight />
								<div style={{position: 'absolute', right: -10, top: -120}}>
									<UpArrow frame={f} at={1} />
								</div>
								<div style={{position: 'absolute', left: 0, right: 0, top: 180, display: 'flex', justifyContent: 'center'}}>
									<Stamp text={'ANNÉE\nRECORD'} frame={f} size={140} />
								</div>
							</div>
						</Stage>
					</AbsoluteFill>
				),
			},
		],
	};
};
