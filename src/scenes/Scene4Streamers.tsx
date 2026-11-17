import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {ChatBubbles, HeartBurst, LiveCard, Shockwave, Stamp} from '../components/Props';
import {Kicker, PopWord, RankBadge, Stage} from '../components/Text';
import {COLORS} from '../constants';
import {easeRamp, fmtInt} from '../lib/anim';
import {wordFrame} from '../timeline';
import type {PlanFn} from './types';

// « Numéro deux : les streamers. Le jour J, des millions de gens vont regarder avant même d'acheter.
//   Ceux qui seront prêts vont exploser ! »
export const plan4: PlanFn = (t) => {
	const B = wordFrame(t, 'streamers', 0.15);
	const C = wordFrame(t, 'le', 0.27);
	const D = wordFrame(t, 'millions', 0.4);
	const E = wordFrame(t, 'avant', 0.58);
	const F = wordFrame(t, 'ceux', 0.73);
	const G = wordFrame(t, 'exploser', 0.88);
	return {
		impacts: [B, C + 6, G],
		chachings: [],
		shots: [
			{
				at: 0,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.pink} />
						<Stage>
							<RankBadge n={2} label="NUMÉRO DEUX" frame={f} color={COLORS.pink} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: B,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop sun grid palms tint={COLORS.pink} />
						<Stage gap={20}>
							<PopWord text="STREAMERS" frame={f} size={200} color={COLORS.pink} />
							<Kicker text="● EN DIRECT" frame={f} at={4} size={90} color={COLORS.white} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: C,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.cyan} />
						<Stage>
							<Stamp text="JOUR J" frame={f} at={2} size={230} color={COLORS.cyan} rotate={-8} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: D,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.violet} />
						<Stage gap={30}>
							<Kicker text="DES MILLIONS DE VIEWERS" frame={f} size={90} color={COLORS.white} />
							<LiveCard frame={f} viewersFrom={12000} viewersTo={2400000} />
						</Stage>
						<ChatBubbles frame={f} x={190} y={1180} />
					</AbsoluteFill>
				),
			},
			{
				at: E,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.pink} />
						<Stage gap={10}>
							<PopWord text="AVANT MÊME" frame={f} size={170} color={COLORS.white} tilt={0} />
							<PopWord text="D'ACHETER" frame={f} at={6} size={170} color={COLORS.cyan} tilt={3} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: F,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.violet} />
						<Stage gap={30}>
							<PopWord text="CEUX QUI SERONT" frame={f} size={130} color={COLORS.white} tilt={0} />
							<PopWord text="PRÊTS" frame={f} at={6} size={260} color={COLORS.pink} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: G,
				render: (f) => {
					const v = 48000 + easeRamp(f, 0, 14) * 2952000;
					return (
						<AbsoluteFill>
							<Backdrop grid tint={COLORS.pink} />
							<Shockwave frame={f} />
							<HeartBurst frame={f} />
							<Stage gap={0}>
								<PopWord text={fmtInt(v)} frame={f} size={200} color={COLORS.white} tilt={0} />
								<Kicker text="VIEWERS" frame={f} at={3} size={120} color={COLORS.cyan} />
							</Stage>
						</AbsoluteFill>
					);
				},
			},
		],
	};
};
