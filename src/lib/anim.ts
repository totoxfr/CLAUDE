import {interpolate, spring, Easing} from 'remotion';
import {SPRING, VIDEO} from '../constants';

const fps = VIDEO.fps;

/** Ressort 0 -> 1 qui démarre à la frame `at`. */
export const pop = (frame: number, at = 0, config: {damping?: number; mass?: number; stiffness?: number} = {}) =>
	spring({frame: frame - at, fps, config: {...SPRING, ...config}});

/** Ressort plus ferme (sans gros dépassement) pour les déplacements. */
export const glide = (frame: number, at = 0, durationInFrames?: number) =>
	spring({frame: frame - at, fps, config: {damping: 16, mass: 0.8, stiffness: 120}, durationInFrames});

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const ramp = (frame: number, from: number, to: number) =>
	interpolate(frame, [from, to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export const easeRamp = (frame: number, from: number, to: number) =>
	interpolate(frame, [from, to], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});

/** Secousse caméra cumulée sur une liste d'impacts (frames). */
export const shake = (frame: number, impacts: number[], strength = 22) => {
	let x = 0;
	let y = 0;
	let r = 0;
	for (const at of impacts) {
		const t = frame - at;
		if (t < 0 || t > 14) continue;
		const a = strength * Math.pow(1 - t / 14, 2);
		x += a * Math.sin(t * 2.9 + at);
		y += a * 0.8 * Math.cos(t * 3.7 + at * 0.5);
		r += a * 0.05 * Math.sin(t * 2.1);
	}
	return {x, y, r};
};

/** Petite oscillation continue (pour que rien ne soit statique). */
export const float = (frame: number, amp = 8, speed = 0.06, phase = 0) => Math.sin(frame * speed + phase) * amp;

export const fmtMoney = (n: number) => `${Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ')} $`;
export const fmtInt = (n: number) => Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ');
