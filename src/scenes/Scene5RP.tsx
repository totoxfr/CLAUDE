import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {CoinStacks, ServerRack, Timeline} from '../components/Props';
import {Kicker, PopWord, RankBadge, Stage} from '../components/Text';
import {COLORS} from '../constants';
import {wordFrame} from '../timeline';
import type {PlanFn} from './types';

// « Troisième : les créateurs de serveurs RP. Sur GTA 5, certains en vivent depuis des années. »
export const plan5: PlanFn = (t) => {
	const B = wordFrame(t, 'créateurs', 0.2);
	const C = wordFrame(t, 'rp', 0.4);
	const D = wordFrame(t, 'sur', 0.5);
	const E = wordFrame(t, 'certains', 0.65);
	return {
		impacts: [C],
		chachings: [wordFrame(t, 'vivent', 0.75)],
		shots: [
			{
				at: 0,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.violet} />
						<Stage>
							<RankBadge n={3} label="TROISIÈME" frame={f} color={COLORS.violet} />
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
							<Kicker text="CRÉATEURS DE SERVEURS" frame={f} size={86} color={COLORS.white} />
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
							<PopWord text="RP" frame={f} size={480} color={COLORS.violet} />
							<Kicker text="ROLEPLAY" frame={f} at={5} size={100} color={COLORS.white} />
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
							<PopWord text="SUR GTA 5" frame={f} size={170} color={COLORS.white} tilt={0} />
							<Timeline frame={f - 3} from="2018" to="2026" />
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
							<Kicker text="CERTAINS EN VIVENT" frame={f} size={96} color={COLORS.white} />
							<CoinStacks frame={f} />
						</Stage>
					</AbsoluteFill>
				),
			},
		],
	};
};
