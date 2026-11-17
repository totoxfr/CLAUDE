import type {Shot} from '../components/Shots';
import type {SceneTiming} from '../timeline';

export type ScenePlan = {
	shots: Shot[];
	/** Frames locales : secousse caméra + SFX impact. */
	impacts: number[];
	/** Frames locales : SFX cha-ching. */
	chachings: number[];
};

export type PlanFn = (t: SceneTiming) => ScenePlan;
