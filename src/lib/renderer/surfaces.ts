import type { MeshStandardMaterial } from 'three';

/**
 * Base surface behaviour (metalness / roughness / env map response) keyed by
 * material name. Applied once per material when a model loads.
 */
export const surfaces: Record<string, Partial<MeshStandardMaterial>> = {
	BodyFrame: { metalness: 1, roughness: 0.2, envMapIntensity: 1.0 },
	GrayGlossy2: { metalness: 1, roughness: 0.08, envMapIntensity: 1.0 },
	GrayGlossy: { metalness: 1, roughness: 0.35, envMapIntensity: 0.8 },
	PacificBlue: { metalness: 0.8, roughness: 0.3, envMapIntensity: 0.8 },
	Body: { metalness: 0.7, roughness: 0.45, envMapIntensity: 0.6 },
	Antenna: { metalness: 1, roughness: 0.7, envMapIntensity: 0.6 },
	Blackmatte: { metalness: 0, roughness: 0.85, envMapIntensity: 0.2 },
	Cameralens: { metalness: 0, roughness: 0.02, envMapIntensity: 0.6 },
	Glass: { metalness: 0, roughness: 0.05, envMapIntensity: 0.3 },
	bezel: { metalness: 0.6, roughness: 0.12, envMapIntensity: 0.5 },
	'bezel.001': { metalness: 0.4, roughness: 0.15, envMapIntensity: 0.4 },
	FrontCamera: { metalness: 0, roughness: 0.85, envMapIntensity: 0.15 },
	MicrophoneSpeaker: { metalness: 0, roughness: 1, envMapIntensity: 0.15 },
	Flash: { metalness: 0.8, roughness: 0.3, envMapIntensity: 0.6 },
	Flash2: { metalness: 0.9, roughness: 0.6, envMapIntensity: 0.5 },
	LiDar: { metalness: 0, roughness: 0.9, envMapIntensity: 0.15 },
	Wallpaper: {
		metalness: 0,
		roughness: 0.6,
		envMapIntensity: 0.15,
		emissiveIntensity: 0.15,
	},
};
