import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {FilmGrain} from './components/Overlays';
import {Subtitles} from './components/Subtitles';
import {TransitionFrame} from './components/Transition';
import {COLORS, TRANSITION_FRAMES, type TransitionKind} from './constants';
import {SceneBody} from './scenes';
import {Soundtrack} from './Soundtrack';
import {TIMELINE, type SceneTiming} from './timeline';

const enterOf = (t: SceneTiming): TransitionKind =>
	t.index === 0 ? 'glitch' /* glitch RGB sur le hook */ : TIMELINE[t.index - 1].def.transitionOut;

const allWords = TIMELINE.flatMap((t) => t.words.map((w) => ({...w, start: w.start + t.from, end: w.end + t.from})));

export const Main: React.FC = () => (
	<AbsoluteFill style={{background: COLORS.night}}>
		{TIMELINE.map((t) => {
			const last = t.index === TIMELINE.length - 1;
			return (
				<Sequence key={t.def.id} from={t.from} durationInFrames={t.duration + (last ? 0 : TRANSITION_FRAMES)} name={t.def.label}>
					<TransitionFrame id={t.def.id} enter={enterOf(t)} exit={last ? 'none' : t.def.transitionOut} duration={t.duration}>
						<SceneBody t={t} />
					</TransitionFrame>
				</Sequence>
			);
		})}
		<FilmGrain />
		<Subtitles words={allWords} />
		<Soundtrack />
	</AbsoluteFill>
);

/** Composition d'une scène isolée (visuel + voix + SFX + sous-titres). */
export const SceneComp: React.FC<{index: number}> = ({index}) => {
	const t = TIMELINE[index];
	return (
		<AbsoluteFill style={{background: COLORS.night}}>
			<TransitionFrame id={`solo-${t.def.id}`} enter={enterOf(t)} exit="none" duration={t.duration}>
				<SceneBody t={t} />
			</TransitionFrame>
			<FilmGrain />
			<Subtitles words={t.words} />
			<Soundtrack scenes={[t]} total={t.duration} music={false} />
		</AbsoluteFill>
	);
};
