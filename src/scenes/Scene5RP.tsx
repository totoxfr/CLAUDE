import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {BuildBlocks, CoinStacks, ServerRack, Timeline} from '../components/Props';
import {Kicker, PopWord, RankBadge, Stage} from '../components/Text';
import {COLORS} from '../constants';
import {wordFrame} from '../timeline';
import type {PlanFn} from './types';

// « Numéro trois : les créateurs de serveurs RP. Sur GTA 5, certains en vivent depuis des années.
//   Et sur le 6, tout est à reconstruire. »
export const plan5: PlanFn = (t) => {
	const B = wordFrame(t, 'createurs', 0.13);
	const C = wordFrame(t, 'rp', 0.27);
	const D = wordFrame(t, 'sur', 0.36);
	const E = wordFrame(t, 'certains', 0.5);
	const F = wordFrame(t, 'et', 0.71);
	const G = wordFrame(t, 'tout', 0.83);
	return {
		impacts: [C, G],
		chachings: [wordFrame(t, 'vivent', 0.56)],
		shots: [
			{
				at: 0,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.violet} />
						<Stage>
							<RankBadge n={3} label="NUMÉRO TROIS" frame={f} color={COLORS.violet} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: B,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.cyan} />
						<Stage gap={50}>
							<Kicker text="CRÉATEURS DE SERVEURS" frame={f} size={90} color={COLORS.white} />
							<ServerRack frame={f} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: C,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop sun grid palms tint={COLORS.violet} />
						<Stage gap={0}>
							<PopWord text="RP" frame={f} size={500} color={COLORS.violet} />
							<Kicker text="ROLEPLAY" frame={f} at={4} size={110} color={COLORS.white} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: D,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.pink} />
						<Stage gap={60}>
							<PopWord text="SUR GTA 5" frame={f} size={180} color={COLORS.white} tilt={0} />
							<Timeline frame={f - 2} from="2015" to="2026" />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: E,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.cyan} />
						<Stage gap={40}>
							<PopWord text="ILS EN VIVENT" frame={f} size={140} color={COLORS.cyan} tilt={-3} />
							<CoinStacks frame={f} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: F,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.violet} />
						<Stage>
							<PopWord text="ET SUR LE 6 ?" frame={f} size={190} color={COLORS.white} tilt={4} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: G,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.pink} />
						<Stage gap={50}>
							<PopWord text="TOUT À RECONSTRUIRE" frame={f} size={110} color={COLORS.pink} tilt={0} />
							<BuildBlocks frame={f} />
						</Stage>
					</AbsoluteFill>
				),
			},
		],
	};
};
