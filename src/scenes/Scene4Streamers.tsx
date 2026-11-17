import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {ChatBubbles, HeartBurst, LiveCard, Shockwave} from '../components/Props';
import {Kicker, PopWord, RankBadge, Stage} from '../components/Text';
import {COLORS} from '../constants';
import {fmtInt, easeRamp} from '../lib/anim';
import {wordFrame} from '../timeline';
import type {PlanFn} from './types';

// « Deuxième : les streamers. Ceux qui seront prêts le jour J vont exploser. »
export const plan4: PlanFn = (t) => {
	const B = wordFrame(t, 'streamers', 0.25);
	const C = wordFrame(t, 'ceux', 0.4);
	const jourJ = wordFrame(t, 'jour', 0.7);
	const D = wordFrame(t, 'exploser', 0.85);
	return {
		impacts: [B, D],
		chachings: [],
		shots: [
			{
				at: 0,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.pink} />
						<Stage>
							<RankBadge n={2} label="DEUXIÈME" frame={f} color={COLORS.pink} />
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
							<Kicker text="● EN DIRECT" frame={f} at={5} size={80} color={COLORS.white} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: C,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.violet} />
						<Stage gap={30}>
							<Kicker text="PRÊTS LE JOUR J ?" frame={f} size={84} color={COLORS.white} />
							<LiveCard frame={f} viewersFrom={1200} viewersTo={48000} boostAt={jourJ - C} />
						</Stage>
						<ChatBubbles frame={f} x={200} y={1150} />
					</AbsoluteFill>
				),
			},
			{
				at: D,
				render: (f) => {
					const v = 48000 + easeRamp(f, 0, 18) * 202000;
					return (
						<AbsoluteFill>
							<Backdrop grid tint={COLORS.pink} />
							<Shockwave frame={f} />
							<HeartBurst frame={f} />
							<Stage gap={0}>
								<PopWord text={fmtInt(v)} frame={f} size={230} color={COLORS.white} tilt={0} />
								<Kicker text="VIEWERS" frame={f} at={4} size={110} color={COLORS.cyan} />
							</Stage>
						</AbsoluteFill>
					);
				},
			},
		],
	};
};
