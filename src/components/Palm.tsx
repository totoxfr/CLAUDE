import React from 'react';
import {COLORS} from '../constants';

// Palmier stylisé 100 % vectoriel (silhouette + liseré néon).
const FROND = 'M0 0 C 70 -50 170 -60 260 -10 C 200 -30 120 -20 60 10 C 40 14 18 10 0 0 Z';
const ANGLES = [-160, -125, -90, -55, -20, 15, 50];

export const Palm: React.FC<{
	x: number;
	y: number; // pied du tronc
	height: number;
	flip?: boolean;
	frame: number;
	glow?: string;
	phase?: number;
}> = ({x, y, height, flip, frame, glow = COLORS.pink, phase = 0}) => {
	const sway = Math.sin(frame * 0.045 + phase) * 3;
	const w = height * 0.6;
	return (
		<svg
			width={w}
			height={height}
			viewBox="0 0 300 500"
			style={{
				position: 'absolute',
				left: x,
				top: y - height,
				transform: `scaleX(${flip ? -1 : 1})`,
				transformOrigin: '50% 100%',
				overflow: 'visible',
				filter: `drop-shadow(0 0 10px ${glow})`,
			}}
		>
			<g transform={`rotate(${sway * 0.4} 150 500)`}>
				<path d="M150 500 C 150 380 170 250 210 110 L 222 114 C 186 250 168 380 168 500 Z" fill={COLORS.night} stroke={glow} strokeWidth={3} />
				{[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
					<line key={i} x1={154 + i * 5} y1={480 - i * 42} x2={168 + i * 5} y2={476 - i * 42} stroke={glow} strokeWidth={2} opacity={0.6} />
				))}
				<g transform={`translate(216 112) rotate(${sway})`}>
					{ANGLES.map((a, i) => (
						<path
							key={a}
							d={FROND}
							transform={`rotate(${a + Math.sin(frame * 0.07 + i + phase) * 4}) scale(${0.85 + (i % 2) * 0.15})`}
							fill={COLORS.night}
							stroke={glow}
							strokeWidth={3}
						/>
					))}
				</g>
			</g>
		</svg>
	);
};
