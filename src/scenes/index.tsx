import React from 'react';
import {Shots} from '../components/Shots';
import {TRANSITION_FRAMES} from '../constants';
import type {SceneTiming} from '../timeline';
import {plan1} from './Scene1Hook';
import {plan2} from './Scene2Twist';
import {plan3} from './Scene3TakeTwo';
import {plan4} from './Scene4Streamers';
import {plan5} from './Scene5RP';
import {plan6} from './Scene6Twist';
import {plan7} from './Scene7CTA';
import type {PlanFn} from './types';

export const PLANS: PlanFn[] = [plan1, plan2, plan3, plan4, plan5, plan6, plan7];

/** Visuel d'une scène (plans + secousses), sans audio ni sous-titres. */
export const SceneBody: React.FC<{t: SceneTiming}> = ({t}) => {
	const plan = PLANS[t.index](t);
	return <Shots shots={plan.shots} total={t.duration + TRANSITION_FRAMES} impacts={plan.impacts} beats={t.words.map((w) => w.start)} />;
};
