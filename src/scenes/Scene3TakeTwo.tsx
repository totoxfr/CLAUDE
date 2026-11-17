import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {RisingChart, Stamp, UpArrow} from '../components/Props';
import {Kicker, PopWord, RankBadge, Stage} from '../components/Text';
import {COLORS} from '../constants';
import {wordFrame} from '../timeline';
import type {PlanFn} from './types';

// « Premier gagnant : Take-Two. L'éditeur s'attend à une année record. »
export const plan3: PlanFn = (t) => {
	const B = wordFrame(t, 'take-two', 0.35);
	const C = wordFrame(t, "l'éditeur", 0.5);
	const D = wordFrame(t, 'record', 0.9);
	return {
		impacts: [B, D],
		chachings: [],
		shots: [
			{
				at: 0,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.cyan} />
						<Stage>
							<RankBadge n={1} label="PREMIER GAGNANT" frame={f} color={COLORS.cyan} />
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
							<PopWord text="TAKE-TWO" frame={f} size={210} color={COLORS.cyan} />
							<Kicker text="L'ÉDITEUR DU JEU" frame={f} at={5} size={80} color={COLORS.white} />
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
							<Kicker text="PRÉVISIONS DE L'ÉDITEUR" frame={f} size={72} color={COLORS.white} />
							<RisingChart frame={f} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: D,
				render: (f) => (
					<AbsoluteFill>
						<Backdrop grid tint={COLORS.pink} />
						<Stage gap={0}>
							<div style={{position: 'relative'}}>
								<RisingChart frame={f + 60} highlight />
								<div style={{position: 'absolute', right: -10, top: -110}}>
									<UpArrow frame={f} at={2} />
								</div>
								<div style={{position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', justifyContent: 'center'}}>
									<Stamp text={'ANNÉE\nRECORD'} frame={f} size={130} />
								</div>
							</div>
						</Stage>
					</AbsoluteFill>
				),
			},
		],
	};
};
