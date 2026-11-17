import React from 'react';
import {Composition, Folder} from 'remotion';
import {VIDEO} from './constants';
import {Main, SceneComp} from './Main';
import {TIMELINE, TOTAL_FRAMES} from './timeline';

export const Root: React.FC = () => (
	<>
		<Composition id="Main" component={Main} durationInFrames={TOTAL_FRAMES} {...VIDEO} />
		<Folder name="Scenes">
			{TIMELINE.map((t) => (
				<Composition
					key={t.def.id}
					id={`Scene${t.index + 1}-${t.def.label.replace(/[^A-Za-z0-9]+/g, '')}`}
					component={SceneComp}
					defaultProps={{index: t.index}}
					durationInFrames={t.duration}
					{...VIDEO}
				/>
			))}
		</Folder>
	</>
);
