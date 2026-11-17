import React from 'react';
import {interpolate, random} from 'remotion';
import {COLORS, VIDEO} from '../constants';
import {easeRamp, float, fmtInt, fmtMoney, glide, pop, ramp} from '../lib/anim';
import {ANTON, BEBAS} from './fonts';
import {glow} from './Text';

// ---------------------------------------------------------------- Compteur $
export const MoneyCounter: React.FC<{
	frame: number;
	from?: number;
	to: number;
	start: number;
	end: number;
	size?: number;
	color?: string;
}> = ({frame, from = 0, to, start, end, size = 170, color = COLORS.cyan}) => {
	const p = easeRamp(frame, start, end);
	const v = from + (to - from) * p;
	const rolling = p > 0 && p < 1;
	const jitter = rolling ? Math.sin(frame * 3) * 4 : 0;
	return (
		<div
			style={{
				fontFamily: ANTON,
				fontSize: size,
				color: COLORS.white,
				textShadow: glow(color),
				fontVariantNumeric: 'tabular-nums',
				transform: `translateY(${jitter}px)`,
				filter: rolling ? 'blur(0.6px)' : undefined,
				whiteSpace: 'nowrap',
			}}
		>
			{fmtMoney(v)}
		</div>
	);
};

// ---------------------------------------------------------------- Pluie de billets
export const MoneyRain: React.FC<{frame: number; count?: number; seed?: string}> = ({frame, count = 18, seed = 'rain'}) => (
	<>
		{new Array(count).fill(0).map((_, i) => {
			const x = random(`${seed}x${i}`) * (VIDEO.width - 160);
			const delay = random(`${seed}d${i}`) * 25;
			const speed = 16 + random(`${seed}s${i}`) * 14;
			const y = -200 + Math.max(0, frame - delay) * speed;
			const rot = (random(`${seed}r${i}`) - 0.5) * 80 + (frame - delay) * (random(`${seed}w${i}`) - 0.5) * 6;
			const c = i % 2 ? COLORS.pink : COLORS.cyan;
			return (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: x,
						top: y,
						width: 150,
						height: 76,
						borderRadius: 10,
						border: `4px solid ${c}`,
						background: `${COLORS.night}cc`,
						boxShadow: glow(c, 0.5),
						transform: `rotate(${rot}deg) rotateX(${Math.sin(frame * 0.2 + i) * 50}deg)`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: ANTON,
						fontSize: 46,
						color: c,
					}}
				>
					$
				</div>
			);
		})}
	</>
);

// ---------------------------------------------------------------- Graphique qui monte
const BARS = [0.22, 0.3, 0.27, 0.42, 0.5, 0.63, 1];
export const RisingChart: React.FC<{frame: number; width?: number; height?: number; highlight?: boolean}> = ({
	frame,
	width = 820,
	height = 640,
	highlight,
}) => {
	const bw = width / BARS.length;
	const pts = BARS.map((v, i) => {
		const g = glide(frame, i * 4);
		return [i * bw + bw / 2, height - v * height * 0.88 * g] as const;
	});
	const lineLen = 2200;
	const draw = easeRamp(frame, 4, 40);
	return (
		<svg width={width} height={height + 40} style={{overflow: 'visible'}}>
			<defs>
				<linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={COLORS.pink} />
					<stop offset="1" stopColor={COLORS.violet} stopOpacity={0.2} />
				</linearGradient>
			</defs>
			{[0.25, 0.5, 0.75].map((g) => (
				<line key={g} x1={0} x2={width} y1={height * g} y2={height * g} stroke={COLORS.white} strokeOpacity={0.12} strokeWidth={2} />
			))}
			{BARS.map((v, i) => {
				const g = glide(frame, i * 4);
				const h = v * height * 0.88 * g;
				const last = i === BARS.length - 1;
				return (
					<rect
						key={i}
						x={i * bw + 14}
						y={height - h}
						width={bw - 28}
						height={h}
						rx={10}
						fill={last && highlight ? COLORS.cyan : 'url(#bar)'}
						style={{filter: last && highlight ? `drop-shadow(0 0 20px ${COLORS.cyan})` : undefined}}
					/>
				);
			})}
			<polyline
				points={pts.map((p) => p.join(',')).join(' ')}
				fill="none"
				stroke={COLORS.cyan}
				strokeWidth={10}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeDasharray={lineLen}
				strokeDashoffset={lineLen * (1 - draw)}
				style={{filter: `drop-shadow(0 0 12px ${COLORS.cyan})`}}
			/>
			<circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={18 * draw} fill={COLORS.white} style={{filter: `drop-shadow(0 0 16px ${COLORS.cyan})`}} />
			<line x1={0} x2={width} y1={height} y2={height} stroke={COLORS.white} strokeWidth={4} />
		</svg>
	);
};

export const UpArrow: React.FC<{frame: number; at?: number; color?: string; size?: number}> = ({frame, at = 0, color = COLORS.cyan, size = 160}) => {
	const p = pop(frame, at);
	return (
		<svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `translateY(${(1 - p) * 80 + float(frame, 8, 0.2)}px) scale(${p})`, filter: `drop-shadow(0 0 14px ${color})`}}>
			<path d="M50 6 L92 52 H66 V94 H34 V52 H8 Z" fill={color} />
		</svg>
	);
};

// ---------------------------------------------------------------- Tampon
export const Stamp: React.FC<{text: string; frame: number; at?: number; color?: string; size?: number; rotate?: number}> = ({
	text,
	frame,
	at = 0,
	color = COLORS.pink,
	size = 120,
	rotate = -12,
}) => {
	const p = pop(frame, at, {damping: 10, stiffness: 220});
	return (
		<div
			style={{
				fontFamily: ANTON,
				fontSize: size,
				color,
				border: `10px solid ${color}`,
				borderRadius: 18,
				padding: '4px 34px',
				textShadow: glow(color, 0.6),
				boxShadow: `${glow(color, 0.6)}, inset ${glow(color, 0.4)}`,
				transform: `rotate(${rotate}deg) scale(${interpolate(p, [0, 1], [3, 1])})`,
				opacity: Math.min(1, p * 3),
				whiteSpace: 'pre',
				lineHeight: 1.05,
				textAlign: 'center',
				background: `${COLORS.night}99`,
			}}
		>
			{text}
		</div>
	);
};

// ---------------------------------------------------------------- Compte à rebours
export const Countdown: React.FC<{frame: number}> = ({frame}) => {
	const secs = 48 * 3600 - frame * 37; // défile vite
	const h = Math.floor(secs / 3600);
	const m = Math.floor((secs % 3600) / 60);
	const s = secs % 60;
	const pad = (n: number) => String(n).padStart(2, '0');
	return (
		<div style={{fontFamily: ANTON, fontSize: 150, color: COLORS.white, textShadow: glow(COLORS.cyan), fontVariantNumeric: 'tabular-nums', letterSpacing: 4}}>
			{pad(h)}:{pad(m)}:{pad(s)}
		</div>
	);
};

// ---------------------------------------------------------------- Carte de live
export const LiveCard: React.FC<{frame: number; viewersFrom: number; viewersTo: number; boostAt?: number}> = ({frame, viewersFrom, viewersTo, boostAt}) => {
	const p = glide(frame, 0);
	const v = interpolate(frame, [0, 60], [viewersFrom, viewersTo], {extrapolateRight: 'clamp'});
	const blink = Math.floor(frame / 8) % 2 === 0;
	return (
		<div
			style={{
				width: 760,
				height: 470,
				borderRadius: 34,
				border: `6px solid ${COLORS.pink}`,
				boxShadow: glow(COLORS.pink, 0.7),
				background: `linear-gradient(160deg, ${COLORS.violet}55, ${COLORS.night} 70%)`,
				position: 'relative',
				overflow: 'hidden',
				transform: `perspective(1200px) rotateY(${(1 - p) * -35 + float(frame, 3, 0.05)}deg) scale(${0.7 + 0.3 * p})`,
			}}
		>
			{/* écran abstrait : soleil + horizon */}
			<div style={{position: 'absolute', left: 230, top: 140, width: 300, height: 300, borderRadius: '50%', background: `linear-gradient(${COLORS.pink}, ${COLORS.violet})`, opacity: 0.8}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 300, bottom: 0, background: `repeating-linear-gradient(90deg, ${COLORS.cyan}66 0 3px, transparent 3px 70px), ${COLORS.night}`}} />
			<div style={{position: 'absolute', left: 28, top: 26, display: 'flex', alignItems: 'center', gap: 12, background: COLORS.pink, borderRadius: 12, padding: '6px 18px', fontFamily: BEBAS, fontSize: 52, color: COLORS.white}}>
				<span style={{width: 20, height: 20, borderRadius: 10, background: COLORS.white, opacity: blink ? 1 : 0.3}} /> LIVE
			</div>
			<div style={{position: 'absolute', right: 28, top: 26, background: `${COLORS.night}cc`, borderRadius: 12, padding: '6px 18px', fontFamily: BEBAS, fontSize: 52, color: COLORS.white, display: 'flex', gap: 12, alignItems: 'center'}}>
				<EyeIcon /> {fmtInt(v)}
			</div>
			{boostAt !== undefined ? (
				<div style={{position: 'absolute', left: 0, right: 0, bottom: 30, display: 'flex', justifyContent: 'center'}}>
					<Stamp text="JOUR J" frame={frame} at={boostAt} color={COLORS.cyan} size={80} rotate={-6} />
				</div>
			) : null}
		</div>
	);
};

const EyeIcon = () => (
	<svg width={44} height={44} viewBox="0 0 24 24">
		<path d="M1 12 C 5 4 19 4 23 12 C 19 20 5 20 1 12 Z" fill="none" stroke={COLORS.white} strokeWidth={2.2} />
		<circle cx={12} cy={12} r={4} fill={COLORS.white} />
	</svg>
);

// ---------------------------------------------------------------- Bulles de chat abstraites
export const ChatBubbles: React.FC<{frame: number; x: number; y: number}> = ({frame, x, y}) => (
	<>
		{new Array(7).fill(0).map((_, i) => {
			const t = (frame - i * 7) / 40;
			if (t < 0 || t > 1) return null;
			const c = [COLORS.pink, COLORS.cyan, COLORS.violet][i % 3];
			return (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: x + (i % 2) * 30,
						top: y - t * 420,
						opacity: 1 - t,
						display: 'flex',
						gap: 10,
						alignItems: 'center',
						transform: `scale(${pop(frame, i * 7)})`,
					}}
				>
					<div style={{width: 40, height: 40, borderRadius: 20, background: c}} />
					<div style={{width: 120 + (i % 3) * 40, height: 26, borderRadius: 13, background: `${COLORS.white}cc`}} />
				</div>
			);
		})}
	</>
);

// ---------------------------------------------------------------- Onde de choc + coeurs
export const Shockwave: React.FC<{frame: number; at?: number}> = ({frame, at = 0}) => (
	<>
		{[0, 6, 12].map((d, i) => {
			const t = ramp(frame, at + d, at + d + 22);
			if (t <= 0 || t >= 1) return null;
			const s = 100 + t * 1300;
			const c = [COLORS.pink, COLORS.cyan, COLORS.violet][i];
			return (
				<div
					key={d}
					style={{
						position: 'absolute',
						left: VIDEO.width / 2 - s / 2,
						top: 700 - s / 2,
						width: s,
						height: s,
						borderRadius: '50%',
						border: `${14 * (1 - t) + 2}px solid ${c}`,
						boxShadow: glow(c),
						opacity: 1 - t,
					}}
				/>
			);
		})}
	</>
);

export const HeartBurst: React.FC<{frame: number; at?: number; cx?: number; cy?: number}> = ({frame, at = 0, cx = VIDEO.width / 2, cy = 700}) => (
	<>
		{new Array(14).fill(0).map((_, i) => {
			const t = frame - at;
			if (t < 0) return null;
			const a = (i / 14) * Math.PI * 2 + random(`ha${i}`) * 0.4;
			const dist = 200 + random(`hd${i}`) * 260;
			const p = glide(t, 0);
			const c = i % 2 ? COLORS.pink : COLORS.cyan;
			return (
				<svg
					key={i}
					width={70}
					height={70}
					viewBox="0 0 24 24"
					style={{
						position: 'absolute',
						left: cx - 35 + Math.cos(a) * dist * p,
						top: cy - 35 + Math.sin(a) * dist * p + t * 2,
						opacity: interpolate(t, [20, 45], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
						transform: `scale(${p}) rotate(${(i - 7) * 8}deg)`,
						filter: `drop-shadow(0 0 10px ${c})`,
					}}
				>
					<path d="M12 21 C 4 14 1 10 3.5 6 C 6 2.5 10 3.5 12 7 C 14 3.5 18 2.5 20.5 6 C 23 10 20 14 12 21 Z" fill={c} />
				</svg>
			);
		})}
	</>
);

// ---------------------------------------------------------------- Serveurs
export const ServerRack: React.FC<{frame: number}> = ({frame}) => (
	<div style={{display: 'flex', gap: 34}}>
		{[0, 1, 2].map((col) => {
			const p = pop(frame, col * 4);
			return (
				<div key={col} style={{display: 'flex', flexDirection: 'column', gap: 16, transform: `translateY(${(1 - p) * 300}px)`, opacity: p}}>
					{[0, 1, 2, 3, 4].map((row) => (
						<div
							key={row}
							style={{
								width: 210,
								height: 74,
								borderRadius: 12,
								border: `4px solid ${COLORS.violet}`,
								background: `${COLORS.nightSoft}`,
								boxShadow: `0 0 18px ${COLORS.violet}88`,
								display: 'flex',
								alignItems: 'center',
								padding: '0 18px',
								gap: 12,
							}}
						>
							{[0, 1, 2].map((led) => {
								const on = random(`led${col}${row}${led}${Math.floor(frame / 4)}`) > 0.35;
								const c = led === 2 ? COLORS.pink : COLORS.cyan;
								return <div key={led} style={{width: 18, height: 18, borderRadius: 9, background: on ? c : `${c}33`, boxShadow: on ? `0 0 12px ${c}` : undefined}} />;
							})}
							<div style={{flex: 1, height: 8, borderRadius: 4, background: `${COLORS.white}33`}} />
						</div>
					))}
				</div>
			);
		})}
	</div>
);

// ---------------------------------------------------------------- Frise temporelle
export const Timeline: React.FC<{frame: number; from: string; to: string}> = ({frame, from, to}) => {
	const draw = easeRamp(frame, 0, 30);
	const W = 780;
	return (
		<div style={{position: 'relative', width: W, height: 200}}>
			<div style={{position: 'absolute', left: 0, top: 90, width: W * draw, height: 10, borderRadius: 5, background: `linear-gradient(90deg, ${COLORS.violet}, ${COLORS.pink}, ${COLORS.cyan})`, boxShadow: glow(COLORS.pink, 0.5)}} />
			{new Array(9).fill(0).map((_, i) => {
				const x = (i / 8) * W;
				const on = draw * W >= x - 1;
				return <div key={i} style={{position: 'absolute', left: x - 14, top: 81, width: 28, height: 28, borderRadius: 14, background: on ? COLORS.white : `${COLORS.white}22`, boxShadow: on ? glow(COLORS.cyan, 0.5) : undefined}} />;
			})}
			<div style={{position: 'absolute', left: -20, top: 130, fontFamily: BEBAS, fontSize: 64, color: COLORS.violet}}>{from}</div>
			<div style={{position: 'absolute', right: -20, top: 130, fontFamily: BEBAS, fontSize: 64, color: COLORS.cyan, opacity: draw}}>{to}</div>
		</div>
	);
};

// ---------------------------------------------------------------- Piles de pièces
export const CoinStacks: React.FC<{frame: number}> = ({frame}) => (
	<div style={{display: 'flex', gap: 40, alignItems: 'flex-end', height: 560}}>
		{[5, 8, 11, 14].map((n, col) => (
			<div key={col} style={{display: 'flex', flexDirection: 'column-reverse', alignItems: 'center'}}>
				{new Array(n).fill(0).map((_, k) => {
					const at = col * 3 + k * 2.2;
					const p = pop(frame, at, {damping: 11});
					if (frame < at) return null;
					const c = col % 2 ? COLORS.cyan : COLORS.pink;
					return (
						<div
							key={k}
							style={{
								width: 150,
								height: 34,
								marginTop: -4,
								borderRadius: '50%',
								border: `4px solid ${c}`,
								background: COLORS.night,
								boxShadow: `0 0 10px ${c}`,
								transform: `translateY(${(1 - p) * -400}px)`,
							}}
						/>
					);
				})}
			</div>
		))}
	</div>
);

// ---------------------------------------------------------------- Carte bancaire (solde réel)
export const BankCard: React.FC<{frame: number}> = ({frame}) => {
	const p = glide(frame, 0);
	const flicker = Math.floor(frame / 3) % 5 === 0 ? 0.55 : 1;
	return (
		<div
			style={{
				width: 720,
				height: 440,
				borderRadius: 36,
				background: `linear-gradient(135deg, ${COLORS.violet}, ${COLORS.nightSoft} 70%)`,
				border: `4px solid ${COLORS.white}55`,
				boxShadow: `0 30px 80px #000a, ${glow(COLORS.violet, 0.6)}`,
				padding: 46,
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				transform: `perspective(1400px) rotateX(${(1 - p) * 50 + float(frame, 4, 0.06)}deg) rotateZ(${-6 + float(frame, 2, 0.05)}deg)`,
			}}
		>
			<div style={{width: 110, height: 80, borderRadius: 14, background: `linear-gradient(135deg, ${COLORS.cyan}aa, ${COLORS.white}55)`}} />
			<div>
				<div style={{fontFamily: BEBAS, fontSize: 52, color: COLORS.dim, letterSpacing: 6}}>TON SOLDE</div>
				<div style={{fontFamily: ANTON, fontSize: 140, color: COLORS.white, opacity: flicker, textShadow: glow(COLORS.pink, 0.5), lineHeight: 1}}>0,00 €</div>
			</div>
		</div>
	);
};

// ---------------------------------------------------------------- Billet in-game
export const NeonBill: React.FC<{frame: number}> = ({frame}) => {
	const p = pop(frame, 0);
	return (
		<div
			style={{
				width: 740,
				height: 370,
				borderRadius: 26,
				border: `8px solid ${COLORS.cyan}`,
				boxShadow: `${glow(COLORS.cyan, 0.8)}, inset 0 0 60px ${COLORS.cyan}55`,
				background: `repeating-linear-gradient(45deg, ${COLORS.nightSoft} 0 18px, ${COLORS.night} 18px 36px)`,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				position: 'relative',
				transform: `scale(${p}) rotate(${(1 - p) * 20 + float(frame, 1.5, 0.08)}deg)`,
			}}
		>
			<div style={{position: 'absolute', inset: 22, border: `3px dashed ${COLORS.pink}aa`, borderRadius: 16}} />
			<div style={{fontFamily: ANTON, fontSize: 124, color: COLORS.white, textShadow: glow(COLORS.pink), whiteSpace: 'nowrap'}}>1 000 000 $</div>
		</div>
	);
};

// ---------------------------------------------------------------- Bouton CTA + cloche
export const SubscribeButton: React.FC<{frame: number; clickAt: number}> = ({frame, clickAt}) => {
	const p = pop(frame, 0);
	const pressed = frame >= clickAt;
	const press = pressed ? 1 - 0.12 * Math.max(0, 1 - (frame - clickAt) / 6) : 1;
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 40, transform: `scale(${p * press})`}}>
			<div
				style={{
					fontFamily: ANTON,
					fontSize: 92,
					padding: '16px 50px',
					borderRadius: 30,
					background: pressed ? COLORS.nightSoft : COLORS.pink,
					color: pressed ? COLORS.pink : COLORS.white,
					border: `6px solid ${COLORS.pink}`,
					boxShadow: glow(COLORS.pink, 0.8),
					whiteSpace: 'nowrap',
				}}
			>
				{pressed ? 'ABONNÉ ✓' : "S'ABONNER"}
			</div>
			<Bell frame={frame} at={clickAt} />
		</div>
	);
};

const Bell: React.FC<{frame: number; at: number}> = ({frame, at}) => {
	const t = frame - at;
	const swing = t > 0 ? Math.sin(t * 0.9) * 28 * Math.exp(-t * 0.08) : 0;
	return (
		<svg width={120} height={120} viewBox="0 0 24 24" style={{transform: `rotate(${swing}deg)`, transformOrigin: '50% 10%', filter: `drop-shadow(0 0 14px ${COLORS.cyan})`}}>
			<path d="M12 2 C 8 2 6 5 6 9 V 14 L 4 17 H 20 L 18 14 V 9 C 18 5 16 2 12 2 Z" fill={COLORS.cyan} />
			<circle cx={12} cy={20} r={2.2} fill={COLORS.cyan} />
		</svg>
	);
};

// ---------------------------------------------------------------- Panneau « attention »
export const WarningSign: React.FC<{frame: number}> = ({frame}) => {
	const p = pop(frame, 0, {damping: 9, stiffness: 220});
	const blink = Math.floor(frame / 4) % 2 === 0;
	return (
		<svg width={360} height={320} viewBox="0 0 120 106" style={{transform: `scale(${p}) rotate(${(1 - p) * -30 + Math.sin(frame * 0.5) * 3}deg)`, filter: `drop-shadow(0 0 ${blink ? 30 : 12}px ${COLORS.pink})`}}>
			<path d="M60 4 L116 100 H4 Z" fill={COLORS.night} stroke={COLORS.pink} strokeWidth={7} strokeLinejoin="round" />
			<rect x={54} y={34} width={12} height={38} rx={5} fill={blink ? COLORS.white : COLORS.pink} />
			<circle cx={60} cy={84} r={7} fill={blink ? COLORS.white : COLORS.pink} />
		</svg>
	);
};

// ---------------------------------------------------------------- Pile de boîtes de jeu (copies vendues)
export const CopiesStack: React.FC<{frame: number}> = ({frame}) => (
	<div style={{position: 'relative', width: 760, height: 380}}>
		{new Array(24).fill(0).map((_, i) => {
			const col = i % 6;
			const row = Math.floor(i / 6);
			const at = i * 1.1;
			const p = pop(frame, at, {damping: 11, stiffness: 200});
			if (frame < at) return null;
			const c = [COLORS.pink, COLORS.cyan, COLORS.violet][(col + row) % 3];
			return (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: 20 + col * 122 + (row % 2) * 30,
						bottom: row * 92,
						width: 104,
						height: 84,
						borderRadius: 10,
						border: `4px solid ${c}`,
						background: `linear-gradient(160deg, ${c}55, ${COLORS.night})`,
						boxShadow: `0 0 14px ${c}88`,
						transform: `translateY(${(1 - p) * -500}px) rotate(${(1 - p) * 40}deg)`,
					}}
				/>
			);
		})}
	</div>
);

// ---------------------------------------------------------------- Blocs qui se construisent
export const BuildBlocks: React.FC<{frame: number}> = ({frame}) => (
	<div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 130px)', gap: 14}}>
		{new Array(15).fill(0).map((_, i) => {
			const at = (14 - i) * 1.6;
			const p = pop(frame, at, {damping: 10, stiffness: 240});
			const c = [COLORS.violet, COLORS.cyan, COLORS.pink][i % 3];
			return (
				<div
					key={i}
					style={{
						width: 130,
						height: 90,
						borderRadius: 10,
						border: `4px dashed ${c}`,
						background: frame > at + 6 ? `${c}44` : 'transparent',
						boxShadow: `0 0 12px ${c}66`,
						transform: `translateY(${(1 - p) * -700}px) scale(${0.4 + 0.6 * p})`,
						opacity: frame < at ? 0 : 1,
					}}
				/>
			);
		})}
	</div>
);

// ---------------------------------------------------------------- Paiement (tu achètes le jeu)
export const Checkout: React.FC<{frame: number}> = ({frame}) => {
	const p = glide(frame, 0);
	const ok = frame > 14;
	const okP = pop(frame, 14, {damping: 9});
	return (
		<div
			style={{
				width: 720,
				padding: '40px 50px',
				boxSizing: 'border-box',
				borderRadius: 36,
				background: `linear-gradient(150deg, ${COLORS.nightSoft}, ${COLORS.night})`,
				border: `5px solid ${ok ? COLORS.cyan : COLORS.white}55`,
				boxShadow: glow(ok ? COLORS.cyan : COLORS.violet, 0.5),
				transform: `perspective(1200px) rotateX(${(1 - p) * 60}deg) translateY(${(1 - p) * 200}px)`,
				display: 'flex',
				flexDirection: 'column',
				gap: 24,
			}}
		>
			<div style={{fontFamily: BEBAS, fontSize: 56, letterSpacing: 6, color: COLORS.dim}}>PANIER</div>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
				<div style={{width: 120, height: 150, borderRadius: 14, background: `linear-gradient(${COLORS.pink}, ${COLORS.violet})`, boxShadow: glow(COLORS.pink, 0.4)}} />
				<div style={{fontFamily: ANTON, fontSize: 92, color: COLORS.white}}>1 JEU</div>
			</div>
			<div
				style={{
					alignSelf: 'center',
					fontFamily: ANTON,
					fontSize: 74,
					padding: '10px 40px',
					borderRadius: 20,
					background: ok ? COLORS.cyan : COLORS.pink,
					color: COLORS.night,
					transform: `scale(${ok ? 0.8 + 0.2 * okP : 1})`,
				}}
			>
				{ok ? 'PAYÉ ✓' : 'ACHETER'}
			</div>
		</div>
	);
};

// ---------------------------------------------------------------- Badge « partie 2 »
export const PartTwo: React.FC<{frame: number}> = ({frame}) => {
	const p = pop(frame, 0, {damping: 9, stiffness: 200});
	return (
		<div
			style={{
				fontFamily: ANTON,
				fontSize: 150,
				color: COLORS.night,
				background: COLORS.cyan,
				padding: '6px 50px',
				borderRadius: 24,
				boxShadow: glow(COLORS.cyan),
				transform: `scale(${p}) rotate(${-8 + Math.sin(frame * 0.3) * 3}deg)`,
				whiteSpace: 'nowrap',
			}}
		>
			PARTIE 2
		</div>
	);
};
