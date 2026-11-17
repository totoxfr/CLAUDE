import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/** Grain léger animé + vignette. */
export const FilmGrain: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<>
			<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.16}}>
				<svg width="100%" height="100%">
					<filter id="grain">
						<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 12} stitchTiles="stitch" />
						<feColorMatrix type="saturate" values="0" />
					</filter>
					<rect width="100%" height="100%" filter="url(#grain)" />
				</svg>
			</AbsoluteFill>
			<AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
		</>
	);
};
