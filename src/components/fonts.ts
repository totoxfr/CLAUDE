// Polices auto-hébergées (OFL) : le rendu ne dépend pas du réseau.
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const ANTON = 'Anton';
export const BEBAS = 'Bebas Neue';

loadFont({family: ANTON, url: staticFile('fonts/anton-latin.woff2'), weight: '400'});
loadFont({family: BEBAS, url: staticFile('fonts/bebas-latin.woff2'), weight: '400'});
