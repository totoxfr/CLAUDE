import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {SubscribeButton} from '../components/Props';
import {Kicker, PopWord, Stage} from '../components/Text';
import {COLORS} from '../constants';
import {wordFrame} from '../timeline';
import type {PlanFn} from './types';

// CTA : « Abonne-toi pour la suite. »
export const plan7: PlanFn = (t) => {
	const A = wordFrame(t, 'abonne-toi', 0.05);
	const B = wordFrame(t, 'pour', 0.55);
	const click = B + 14;
	return {
		impacts: [A, click],
		chachings: [],
		shots: [
			{
				at: 0,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop sun grid palms tint={COLORS.pink} />
						<Stage>
							<PopWord text="ABONNE-TOI" frame={f} at={A} size={200} color={COLORS.pink} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: B,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop sun grid palms tint={COLORS.violet} />
						<Stage gap={70}>
							<SubscribeButton frame={f} clickAt={click - B} />
							<Kicker text="POUR LA SUITE →" frame={f} at={4} size={110} color={COLORS.cyan} />
						</Stage>
					</AbsoluteFill>
				),
			},
		],
	};
};
