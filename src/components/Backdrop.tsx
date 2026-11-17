import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {COLORS, VIDEO} from '../constants';
import {Palm} from './Palm';

type Props = {
	sun?: boolean;
	grid?: boolean;
	palms?: boolean;
	particles?: boolean;
	tint?: string; // couleur du halo principal
	horizon?: number; // y de l'horizon
};

/** Décor « nuit de Miami » : dégradé, soleil rayé, sol quadrillé, palmiers, particules. */
export const Backdrop: React.FC<Props> = ({
	sun = false,
	grid = true,
	palms = false,
	particles = true,
	tint = COLORS.violet,
	horizon = 1180,
}) => {
	const f = useCurrentFrame();
	const roll = Math.sin(f * 0.035) * 1.6;
	return (
		<AbsoluteFill style={{background: COLORS.night, overflow: 'hidden', transform: `rotate(${roll}deg) scale(1.08)`}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 90% 55% at 50% ${horizon - 120}px, ${tint}55 0%, ${COLORS.nightSoft} 45%, ${COLORS.night} 80%)`,
				}}
			/>
			{sun ? <Sun y={horizon} frame={f} /> : null}
			{grid ? <Grid y={horizon} frame={f} /> : null}
			{palms ? (
				<>
					<Palm x={-60} y={horizon + 40} height={900} flip={false} frame={f} glow={COLORS.pink} />
					<Palm x={VIDEO.width - 240} y={horizon + 80} height={780} flip frame={f} glow={COLORS.cyan} phase={1.3} />
				</>
			) : null}
			{particles ? <Particles frame={f} /> : null}
			<Sweep frame={f} />
		</AbsoluteFill>
	);
};

const Sun: React.FC<{y: number; frame: number}> = ({y, frame}) => {
	const size = 640;
	const visible = size * 0.42; // seule la moitié haute dépasse de l'horizon
	const stripeShift = (frame * 0.6) % 40;
	return (
		<div style={{position: 'absolute', left: VIDEO.width / 2 - size / 2, top: y - visible, width: size, height: visible, overflow: 'hidden'}}>
			<div
				style={{
					width: size,
					height: size,
					borderRadius: '50%',
					background: `linear-gradient(180deg, ${COLORS.pink} 0%, #FF5FA8 25%, ${COLORS.violet} 60%)`,
					boxShadow: `0 0 120px ${COLORS.pink}88`,
					WebkitMaskImage: `linear-gradient(180deg, #000 0px, #000 ${visible * 0.45}px, transparent ${visible * 0.45}px), repeating-linear-gradient(180deg, #000 0px, #000 ${20 - stripeShift * 0.1}px, transparent ${20 - stripeShift * 0.1}px, transparent 34px)`,
					opacity: 0.9,
				}}
			/>
		</div>
	);
};

// Sol quadrillé en perspective (SVG 2D, fiable au rendu).
const Grid: React.FC<{y: number; frame: number}> = ({y, frame}) => {
	const W = VIDEO.width;
	const h = VIDEO.height - y;
	const N = 14;
	const phase = (frame * 0.12) % 1;
	const rows = new Array(N).fill(0).map((_, k) => {
		const t = (k + phase) / N;
		return {yy: h * t * t, o: Math.min(1, t * 2.2)};
	});
	const cols = new Array(25).fill(0).map((_, i) => (i - 12) * 260);
	return (
		<svg width={W} height={h} style={{position: 'absolute', left: 0, top: y, overflow: 'hidden'}}>
			<defs>
				<linearGradient id="gridfade" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={COLORS.night} stopOpacity={0.9} />
					<stop offset="0.35" stopColor={COLORS.night} stopOpacity={0} />
					<stop offset="1" stopColor={COLORS.night} stopOpacity={0.55} />
				</linearGradient>
			</defs>
			{cols.map((x) => (
				<line key={x} x1={W / 2} y1={0} x2={W / 2 + x} y2={h} stroke={COLORS.pink} strokeWidth={3} opacity={0.75} />
			))}
			{rows.map((r, k) => (
				<line key={k} x1={0} x2={W} y1={r.yy} y2={r.yy} stroke={COLORS.cyan} strokeWidth={2 + r.o * 2} opacity={r.o * 0.8} />
			))}
			<rect width={W} height={h} fill="url(#gridfade)" />
			<rect width={W} height={4} fill={COLORS.pink} style={{filter: `drop-shadow(0 0 12px ${COLORS.pink})`}} />
		</svg>
	);
};

const Particles: React.FC<{frame: number}> = ({frame}) => (
	<>
		{new Array(26).fill(0).map((_, i) => {
			const x = random(`px${i}`) * VIDEO.width;
			const speed = 1 + random(`ps${i}`) * 3;
			const y = (VIDEO.height + 100 - ((frame * speed + random(`py${i}`) * VIDEO.height) % (VIDEO.height + 200)));
			const s = 3 + random(`pz${i}`) * 6;
			const c = [COLORS.pink, COLORS.cyan, COLORS.violet][i % 3];
			return (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: x + Math.sin(frame * 0.05 + i) * 20,
						top: y,
						width: s,
						height: s,
						borderRadius: '50%',
						background: c,
						boxShadow: `0 0 ${s * 3}px ${c}`,
						opacity: 0.55,
					}}
				/>
			);
		})}
	</>
);

/** Faisceau lumineux diagonal qui balaie l'écran en boucle. */
const Sweep: React.FC<{frame: number}> = ({frame}) => {
	const t = (frame % 50) / 50;
	const x = -600 + t * (VIDEO.width + 1200);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: -200,
				width: 220,
				height: VIDEO.height + 400,
				transform: 'rotate(18deg)',
				background: `linear-gradient(90deg, transparent, ${COLORS.white}14, ${COLORS.cyan}22, transparent)`,
				mixBlendMode: 'screen',
			}}
		/>
	);
};
