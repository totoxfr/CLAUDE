import React from 'react';
import {COLORS} from '../constants';
import {pop} from '../lib/anim';
import {ANTON, BEBAS} from './fonts';

export const glow = (c: string, k = 1) =>
	`0 0 ${8 * k}px ${c}, 0 0 ${24 * k}px ${c}, 0 0 ${60 * k}px ${c}aa`;

/** Gros mot-clé qui « pop » en couleur (kinetic typography). */
export const PopWord: React.FC<{
	text: string;
	frame: number;
	at?: number;
	color?: string;
	size?: number;
	tilt?: number;
	style?: React.CSSProperties;
	stroke?: boolean;
}> = ({text, frame, at = 0, color = COLORS.pink, size = 200, tilt = -4, style, stroke}) => {
	const p = pop(frame, at);
	const breathe = 1 + Math.sin((frame - at) * 0.15) * 0.015;
	return (
		<div
			style={{
				fontFamily: ANTON,
				fontSize: size,
				lineHeight: 0.95,
				textTransform: 'uppercase',
				color: stroke ? 'transparent' : color,
				WebkitTextStroke: stroke ? `4px ${color}` : `${Math.round(size * 0.035)}px ${COLORS.night}`,
				paintOrder: 'stroke fill',
				textShadow: stroke ? undefined : `${glow(color)}, 0 ${Math.round(size * 0.04)}px 0 ${COLORS.night}`,
				transform: `scale(${(0.2 + 0.8 * p) * breathe}) rotate(${tilt * (1 - p) * 3 + tilt * 0.3}deg)`,
				opacity: Math.min(1, p * 2),
				textAlign: 'center',
				whiteSpace: 'nowrap',
				...style,
			}}
		>
			{text}
		</div>
	);
};

/** Petit libellé au-dessus/au-dessous d'un titre. */
export const Kicker: React.FC<{text: string; frame: number; at?: number; color?: string; size?: number; style?: React.CSSProperties}> = ({
	text,
	frame,
	at = 0,
	color = COLORS.cyan,
	size = 64,
	style,
}) => {
	const p = pop(frame, at);
	const fit = Math.min(size, 820 / (text.length * 0.52));
	return (
		<div
			style={{
				fontFamily: BEBAS,
				fontSize: fit,
				letterSpacing: fit * 0.12,
				color,
				textShadow: `${glow(color, 0.6)}, 0 4px 0 ${COLORS.night}`,
				transform: `translateY(${(1 - p) * 60}px)`,
				opacity: p,
				textAlign: 'center',
				whiteSpace: 'nowrap',
				...style,
			}}
		>
			{text}
		</div>
	);
};

/** Badge de classement (#1, #2, #3). */
export const RankBadge: React.FC<{n: number; label: string; frame: number; color: string}> = ({n, label, frame, color}) => {
	const p = pop(frame, 0);
	const spin = (1 - p) * -180;
	const ring = frame * 2;
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
			<div
				style={{
					width: 460,
					height: 460,
					borderRadius: '50%',
					border: `10px solid ${color}`,
					boxShadow: `${glow(color)}, inset ${glow(color)}`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					transform: `scale(${p}) rotate(${spin}deg)`,
					position: 'relative',
				}}
			>
				<svg width={560} height={560} style={{position: 'absolute', left: -60, top: -60, transform: `rotate(${ring}deg)`}}>
					<circle cx={280} cy={280} r={262} fill="none" stroke={COLORS.white} strokeWidth={4} strokeDasharray="18 30" opacity={0.6} />
				</svg>
				<div style={{fontFamily: ANTON, fontSize: 280, color: COLORS.white, textShadow: glow(color), lineHeight: 1}}>#{n}</div>
			</div>
			<Kicker text={label} frame={frame} at={6} color={color} size={96} />
		</div>
	);
};

/** Centre son contenu dans la zone « image » (au-dessus des sous-titres). */
export const Stage: React.FC<{children: React.ReactNode; top?: number; height?: number; gap?: number}> = ({
	children,
	top = 230,
	height = 1000,
	gap = 30,
}) => (
	<div
		style={{
			position: 'absolute',
			left: 0,
			right: 0,
			top,
			height,
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			gap,
		}}
	>
		{children}
	</div>
);
