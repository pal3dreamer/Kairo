import type { MaterialPreset, MaterialPresetId } from './types';

/**
 * A mesh belongs to the body / finish when its name matches a body pattern and
 * not a front pattern. Front-facing parts (screen bezel, notch, front cameras,
 * mic) must stay dark regardless of the chosen color.
 */
const BODY_PATTERNS = ['BodyFrame', 'GrayGlossy2', 'GrayGlossy', 'PacificBlue', 'Logo', 'Body'];
const FRONT_PATTERNS = ['Bezel', 'FrontCamera', 'FrontMic', 'Screen'];

export function isBodyMesh(name: string): boolean {
	return (
		BODY_PATTERNS.some((p) => name.includes(p)) && !FRONT_PATTERNS.some((p) => name.includes(p))
	);
}

export function isFrontMesh(name: string): boolean {
	return FRONT_PATTERNS.some((p) => name.includes(p));
}

export function isLogoMesh(name: string): boolean {
	return name.includes('Logo');
}

/**
 * Surface treatments — how the body reacts to light (metalness / roughness /
 * env map). The color is applied independently via `./bodyColors.ts`.
 *
 * Not every GLB has every material variant: names that don't exist in a model
 * are skipped, so a preset never breaks a model that lacks parts of it.
 */
export const materialPresets: Record<MaterialPresetId, MaterialPreset> = {
	metal: {
		id: 'metal',
		label: 'Metal',
		surfaces: {
			BodyFrame: { metalness: 1, roughness: 0.22, envMapIntensity: 1.0 },
			GrayGlossy2: { metalness: 1, roughness: 0.09, envMapIntensity: 1.0 },
			GrayGlossy: { metalness: 1, roughness: 0.3, envMapIntensity: 0.9 },
			PacificBlue: { metalness: 0.85, roughness: 0.28, envMapIntensity: 0.9 },
			Body: { metalness: 0.75, roughness: 0.42, envMapIntensity: 0.7 },
			bezel: { metalness: 0.65, roughness: 0.12, envMapIntensity: 0.6 },
			'bezel.001': { metalness: 0.5, roughness: 0.15, envMapIntensity: 0.5 },
		},
	},
	matte: {
		id: 'matte',
		label: 'Matte',
		surfaces: {
			BodyFrame: { metalness: 0.1, roughness: 0.85, envMapIntensity: 0.2 },
			GrayGlossy2: { metalness: 0.1, roughness: 0.9, envMapIntensity: 0.18 },
			GrayGlossy: { metalness: 0.1, roughness: 0.85, envMapIntensity: 0.2 },
			PacificBlue: { metalness: 0.08, roughness: 0.88, envMapIntensity: 0.2 },
			Body: { metalness: 0.1, roughness: 0.9, envMapIntensity: 0.18 },
			bezel: { metalness: 0.15, roughness: 0.8, envMapIntensity: 0.22 },
			'bezel.001': { metalness: 0.12, roughness: 0.82, envMapIntensity: 0.2 },
		},
	},
	glossy: {
		id: 'glossy',
		label: 'Glossy',
		surfaces: {
			BodyFrame: { metalness: 0.05, roughness: 0.05, envMapIntensity: 1.0 },
			GrayGlossy2: { metalness: 0.05, roughness: 0.03, envMapIntensity: 1.1 },
			GrayGlossy: { metalness: 0.05, roughness: 0.06, envMapIntensity: 0.95 },
			PacificBlue: { metalness: 0.05, roughness: 0.07, envMapIntensity: 0.9 },
			Body: { metalness: 0.05, roughness: 0.08, envMapIntensity: 0.85 },
			bezel: { metalness: 0.15, roughness: 0.04, envMapIntensity: 0.9 },
			'bezel.001': { metalness: 0.1, roughness: 0.05, envMapIntensity: 0.85 },
		},
	},
	satin: {
		id: 'satin',
		label: 'Satin',
		surfaces: {
			BodyFrame: { metalness: 0.35, roughness: 0.4, envMapIntensity: 0.55 },
			GrayGlossy2: { metalness: 0.35, roughness: 0.45, envMapIntensity: 0.5 },
			GrayGlossy: { metalness: 0.35, roughness: 0.4, envMapIntensity: 0.55 },
			PacificBlue: { metalness: 0.3, roughness: 0.45, envMapIntensity: 0.5 },
			Body: { metalness: 0.35, roughness: 0.5, envMapIntensity: 0.45 },
			bezel: { metalness: 0.4, roughness: 0.35, envMapIntensity: 0.5 },
			'bezel.001': { metalness: 0.3, roughness: 0.4, envMapIntensity: 0.45 },
		},
	},
	brushed: {
		id: 'brushed',
		label: 'Brushed',
		surfaces: {
			BodyFrame: { metalness: 1, roughness: 0.55, envMapIntensity: 0.5 },
			GrayGlossy2: { metalness: 1, roughness: 0.6, envMapIntensity: 0.45 },
			GrayGlossy: { metalness: 1, roughness: 0.55, envMapIntensity: 0.5 },
			PacificBlue: { metalness: 0.9, roughness: 0.55, envMapIntensity: 0.5 },
			Body: { metalness: 0.85, roughness: 0.6, envMapIntensity: 0.45 },
			bezel: { metalness: 0.8, roughness: 0.5, envMapIntensity: 0.5 },
			'bezel.001': { metalness: 0.7, roughness: 0.55, envMapIntensity: 0.45 },
		},
	},
};
