// Fichier unique de constantes : couleurs, timing, audio, script.
// Importé à la fois par Remotion et par les scripts Node (scripts/*.ts),
// donc : pas d'import, pas d'enum, uniquement de la syntaxe TS « effaçable ».

export const VIDEO = {width: 1080, height: 1920, fps: 30} as const;

export const COLORS = {
	pink: '#FF2E88',
	cyan: '#00E5FF',
	violet: '#7B2CFF',
	night: '#0B0614',
	nightSoft: '#1A0B2E',
	white: '#FFF4FB',
	dim: 'rgba(255,244,251,0.55)',
} as const;

// Zones à éviter (UI TikTok) + marges générales.
export const SAFE = {
	top: 180,
	bottom: 250,
	right: 150,
	left: 150, // symétrique pour garder les sous-titres centrés
} as const;

// Ressort par défaut de toutes les animations.
export const SPRING = {damping: 12, mass: 0.7, stiffness: 160} as const;

// ---- Timing global --------------------------------------------------------
// Durée visée. La durée réelle = voix + respirations (leadIn/tail) ;
// le temps restant pour atteindre la cible est réparti sur les « tail »
// selon tailWeight. La voix pilote toujours le montage.
// 0 = durée 100 % pilotée par la voix (pas de temps mort ajouté).
export const TARGET_SECONDS = 0;
export const TRANSITION_FRAMES = 6; // chevauchement visuel entre scènes
export const MAX_SHOT_FRAMES = 45; // 1,5 s : au-delà, recadrage automatique
export const MIN_SHOT_FRAMES = 10;

export type TransitionKind =
	| 'glitch'
	| 'whipX'
	| 'whipY'
	| 'slideMask'
	| 'zoomPunch'
	| 'glitchLight'
	| 'none';

export type SceneDef = {
	id: string;
	label: string;
	/** Texte envoyé à ElevenLabs (balises <break> autorisées). */
	tts: string;
	/** Respiration avant la voix (s). */
	leadIn: number;
	/** Respiration minimale après la voix (s). */
	tail: number;
	/** Part du temps additionnel (pour atteindre TARGET_SECONDS). */
	tailWeight: number;
	/** Transition vers la scène suivante. */
	transitionOut: TransitionKind;
};

export const SCENES: SceneDef[] = [
	{
		id: 's1',
		label: 'Hook',
		tts: 'GTA 6 sort dans deux jours. Et crois-moi, il va créer des millionnaires !',
		leadIn: 0,
		tail: 0,
		tailWeight: 1,
		transitionOut: 'glitch',
	},
	{
		id: 's2',
		label: 'Twist',
		tts: 'Mais attention : pas ceux que tu crois.',
		leadIn: 0,
		tail: 0,
		tailWeight: 1,
		transitionOut: 'whipX',
	},
	{
		id: 's3',
		label: 'Take-Two',
		tts: "Gagnant numéro un : Take-Two, l'éditeur. GTA 5, c'est plus de 200 millions de copies vendues. Alors pour le 6, ils visent une année record.",
		leadIn: 0,
		tail: 0,
		tailWeight: 1,
		transitionOut: 'slideMask',
	},
	{
		id: 's4',
		label: 'Streamers',
		tts: "Numéro deux : les streamers. Le jour J, des millions de gens vont regarder avant même d'acheter. Ceux qui seront prêts vont exploser !",
		leadIn: 0,
		tail: 0,
		tailWeight: 1,
		transitionOut: 'zoomPunch',
	},
	{
		id: 's5',
		label: 'Serveurs RP',
		tts: 'Numéro trois : les créateurs de serveurs RP. Sur GTA 5, certains en vivent depuis des années. Et sur le 6, tout est à reconstruire.',
		leadIn: 0,
		tail: 0,
		tailWeight: 1,
		transitionOut: 'whipY',
	},
	{
		id: 's6',
		label: 'Chute',
		tts: "Et toi dans tout ça ? Tu vas acheter le jeu, et le seul million que tu vas toucher, c'est celui de Vice City !",
		leadIn: 0,
		tail: 0,
		tailWeight: 1,
		transitionOut: 'glitchLight',
	},
	{
		id: 's7',
		label: 'CTA',
		tts: 'Abonne-toi, la partie deux arrive très vite !',
		leadIn: 0,
		tail: 1.0,
		tailWeight: 1,
		transitionOut: 'none',
	},
];

// ---- Voix ------------------------------------------------------------------
// Fournisseur : ElevenLabs si ELEVENLABS_API_KEY est défini, sinon voix neuronale
// Microsoft Edge gratuite (edge-tts). Forçable via TTS_PROVIDER=elevenlabs|edge|silent.
export const EDGE_VOICE = {
	voice: 'fr-FR-RemyMultilingualNeural', // alternative : 'fr-FR-HenriNeural'
	rate: '+12%',
	pitch: '+0Hz',
} as const;

// Chatterbox Multilingual (Resemble AI, open source, local) : fournisseur par défaut
// s'il est installé (voir README). Référence de voix : tts/ref/custom.wav si présent,
// sinon tts/ref/default.wav (voix masculine synthétique).
export const CHATTERBOX = {
	exaggeration: 0.7, // expressivité (0.5 = neutre, 0.7-0.9 = très dynamique)
	cfgWeight: 0.4, // plus bas = débit plus libre
	temperature: 0.8,
	maxTries: 3, // prises max par scène (la meilleure est gardée)
	minScore: 0.8, // fidélité minimale transcription/texte pour accepter une prise
	seed: 7,
	whisperModel: 'small',
} as const;

// Prononciation (voix uniquement — les sous-titres gardent le vrai texte).
// Clé = mot du script tel quel (ponctuation comprise).
export const PRONUNCIATION: Record<string, string> = {
	GTA: 'G. T. A.', // lettres détachées, sinon « gétéa » se fond dans la phrase
	'6': 'six,', // la virgule force « sisse » (sinon « si sort »)
	'5,': 'cinq,',
	'RP.': 'erre pé.',
	'Take-Two.': 'Tèk Tou.',
};

export const VOICE = {
	modelId: 'eleven_multilingual_v2',
	outputFormat: 'mp3_44100_128',
	gender: 'male',
	settings: {
		stability: 0.4,
		similarity_boost: 0.8,
		style: 0.35,
		use_speaker_boost: true,
	},
} as const;

// ---- Mix audio ------------------------------------------------------------
export const AUDIO = {
	voiceDb: 0,
	musicUnderVoiceDb: -14,
	musicBetweenDb: -6,
	duckAttackFrames: 4,
	duckReleaseFrames: 10,
	/** Un silence de voix plus court que ça ne remonte pas la musique. */
	duckHoldFrames: 9,
	musicFadeInFrames: 6,
	musicFadeOutFrames: 30,
	sfxDb: {whoosh: -8, impact: -6, chaching: -7, glitch: -9},
	whooshLeadFrames: 5, // whoosh démarre un peu avant le cut
} as const;

export const ASSETS = {
	music: 'music.mp3',
	sfx: {
		whoosh: 'sfx/whoosh.mp3',
		impact: 'sfx/impact.mp3',
		chaching: 'sfx/chaching.mp3',
		glitch: 'sfx/glitch.mp3',
	},
} as const;

// ---- Sous-titres ----------------------------------------------------------
export const SUBS = {
	maxWords: 4,
	minWords: 2,
	breakGapSeconds: 0.35, // silence qui force un nouveau groupe
	centerY: 1440, // centre du bloc (tiers bas, au-dessus de la marge de 250 px)
	maxFontSize: 104,
	minFontSize: 64,
} as const;
