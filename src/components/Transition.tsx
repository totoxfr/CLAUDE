import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {COLORS, TRANSITION_FRAMES, VIDEO, type TransitionKind} from '../constants';
import {clamp01} from '../lib/anim';

type Phase = 'in' | 'out';
const T = TRANSITION_FRAMES;
const W = VIDEO.width;
const H = VIDEO.height;
const inOut = (p: number) => interpolate(p, [0, 1], [0, 1], {easing: Easing.inOut(Easing.cubic)});

/** Masque en bandes horizontales aléatoires (glitch). */
const bandMask = (p: number, frame: number, seed: string, n = 16) => {
	const stops: string[] = [];
	for (let k = 0; k < n; k++) {
		const on = random(`${seed}${k}-${Math.floor(frame / 2)}`) < p * 1.25;
		const c = on ? '#000' : 'transparent';
		stops.push(`${c} ${(k / n) * 100}%`, `${c} ${((k + 1) / n) * 100}%`);
	}
	return `linear-gradient(180deg, ${stops.join(', ')})`;
};

type FX = {style: React.CSSProperties; blur?: [number, number]; rgb?: number; flash?: number};

const fx = (kind: TransitionKind, phase: Phase, p: number, frame: number, seed: string): FX => {
	const e = inOut(p);
	const speed = Math.sin(Math.PI * p); // pic de vitesse au milieu -> flou de bougé
	switch (kind) {
		case 'whipX':
			return {style: {transform: `translateX(${phase === 'in' ? (1 - e) * W : -e * W}px)`}, blur: [speed * 70, 0]};
		case 'whipY':
			return {style: {transform: `translateY(${phase === 'in' ? (1 - e) * H : -e * H}px)`}, blur: [0, speed * 90]};
		case 'slideMask': {
			if (phase === 'out') return {style: {transform: `translateX(${-e * 260}px)`, filter: `brightness(${1 - 0.5 * e})`}};
			const a = W + 700 - e * (W + 700);
			return {
				style: {
					clipPath: `polygon(${a}px 0, ${W + 10}px 0, ${W + 10}px ${H}px, ${a - 700}px ${H}px)`,
					transform: `translateX(${(1 - e) * 220}px)`,
				},
			};
		}
		case 'zoomPunch':
			return phase === 'in'
				? {style: {transform: `scale(${1.7 - 0.7 * e})`, opacity: clamp01(p * 3), filter: `blur(${(1 - p) * 14}px)`}, flash: (1 - p) * 0.6}
				: {style: {transform: `scale(${1 + e * 1.4})`, filter: `blur(${e * 18}px)`}};
		case 'glitch':
		case 'glitchLight': {
			const k = kind === 'glitch' ? 1 : 0.5;
			const jitter = (random(`${seed}j${frame}`) - 0.5) * 80 * k;
			const strength = phase === 'in' ? 1 - p : p;
			const mask = phase === 'in' ? bandMask(p, frame, seed) : undefined;
			return {
				style: {
					transform: `translateX(${jitter * strength}px) skewX(${jitter * 0.05 * strength}deg)`,
					WebkitMaskImage: mask,
					maskImage: mask,
				},
				rgb: 45 * k * strength,
			};
		}
		default:
			return {style: {}};
	}
};

/** Applique l'entrée (début de scène) et la sortie (chevauchement final) d'une scène. */
export const TransitionFrame: React.FC<{
	enter?: TransitionKind;
	exit?: TransitionKind;
	duration: number; // durée « propre » de la scène (sans le chevauchement)
	id: string;
	children: React.ReactNode;
}> = ({enter = 'none', exit = 'none', duration, id, children}) => {
	const f = useCurrentFrame();
	let cur: FX = {style: {}};
	if (enter !== 'none' && f < T) cur = fx(enter, 'in', f / T, f, `${id}in`);
	else if (exit !== 'none' && f >= duration) cur = fx(exit, 'out', clamp01((f - duration + 1) / T), f, `${id}out`);
	const filterId = `fx-${id}`;
	const hasSvg = (cur.blur && (cur.blur[0] > 0.5 || cur.blur[1] > 0.5)) || (cur.rgb ?? 0) > 0.5;
	const filters = [hasSvg ? `url(#${filterId})` : '', (cur.style.filter as string) ?? ''].filter(Boolean).join(' ');
	return (
		<AbsoluteFill>
			{hasSvg ? (
				<svg width={0} height={0} style={{position: 'absolute'}}>
					<defs>
						<filter id={filterId} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
							{cur.rgb && cur.rgb > 0.5 ? (
								<>
									<feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r" />
									<feOffset in="r" dx={cur.rgb} dy={0} result="r2" />
									<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="g" />
									<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="b" />
									<feOffset in="b" dx={-cur.rgb} dy={cur.rgb * 0.2} result="b2" />
									<feBlend in="r2" in2="g" mode="screen" result="rg" />
									<feBlend in="rg" in2="b2" mode="screen" />
								</>
							) : (
								<feGaussianBlur in="SourceGraphic" stdDeviation={`${cur.blur![0]} ${cur.blur![1]}`} />
							)}
						</filter>
					</defs>
				</svg>
			) : null}
			<AbsoluteFill style={{...cur.style, filter: filters || undefined}}>{children}</AbsoluteFill>
			{cur.flash ? <AbsoluteFill style={{background: COLORS.pink, opacity: cur.flash * 0.6, mixBlendMode: 'screen'}} /> : null}
			{cur.rgb && cur.rgb > 0.5 ? <Scanlines strength={cur.rgb / 45} /> : null}
		</AbsoluteFill>
	);
};

const Scanlines: React.FC<{strength: number}> = ({strength}) => (
	<AbsoluteFill
		style={{
			backgroundImage: `repeating-linear-gradient(180deg, ${COLORS.cyan}33 0 2px, transparent 2px 6px)`,
			opacity: strength,
			mixBlendMode: 'screen',
		}}
	/>
);
