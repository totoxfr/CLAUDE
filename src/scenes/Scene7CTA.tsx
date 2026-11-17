import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {PartTwo, SubscribeButton} from '../components/Props';
import {PopWord, Stage} from '../components/Text';
import {COLORS} from '../constants';
import {wordFrame} from '../timeline';
import type {PlanFn} from './types';

// CTA : « Abonne-toi, la partie deux arrive très vite ! »
export const plan7: PlanFn = (t) => {
	const B = wordFrame(t, 'la', 0.3);
	const click = B + 10;
	return {
		impacts: [0, click],
		chachings: [],
		shots: [
			{
				at: 0,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop sun grid palms tint={COLORS.pink} />
						<Stage gap={70}>
							<PopWord text="ABONNE-TOI" frame={f} size={200} color={COLORS.pink} />
							<SubscribeButton frame={f} clickAt={B} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: B,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop sun grid palms tint={COLORS.violet} />
						<Stage gap={60}>
							<PartTwo frame={f} />
							<PopWord text="TRÈS VITE" frame={f} at={10} size={170} color={COLORS.white} tilt={-4} />
						</Stage>
					</AbsoluteFill>
				),
			},
		],
	};
};
