import type { StudioPreset, StudioPresetId } from './types';

/**
 * Studio presets — PLACEHOLDERS ONLY.
 *
 * TODO(user): provide the real values for each preset (HDRI, exposure, light
 * rig, background). Until then every field is `null` and the renderer falls
 * back to the default setup in `./defaults.ts`.
 */
export const studioPresets: Record<StudioPresetId, StudioPreset> = {
	soft: {
		id: 'soft',
		label: 'Soft Studio',
		swatch: '#d6d6d6',
		// TODO(user): HDRI
		hdri: null,
		// TODO(user): exposure
		exposure: null,
		// TODO(user): lights
		lights: null,
		// TODO(user): background
		background: null,
	},
	hard: {
		id: 'hard',
		label: 'Hard Studio',
		swatch: '#4a4a4a',
		// TODO(user): HDRI
		hdri: null,
		// TODO(user): exposure
		exposure: null,
		// TODO(user): lights
		lights: null,
		// TODO(user): background
		background: null,
	},
	apple: {
		id: 'apple',
		label: 'Apple',
		swatch: '#f5f5f7',
		// TODO(user): HDRI
		hdri: null,
		// TODO(user): exposure
		exposure: null,
		// TODO(user): lights
		lights: null,
		// TODO(user): background
		background: null,
	},
	dark: {
		id: 'dark',
		label: 'Dark',
		swatch: '#16161a',
		// TODO(user): HDRI
		hdri: null,
		// TODO(user): exposure
		exposure: null,
		// TODO(user): lights
		lights: null,
		// TODO(user): background
		background: null,
	},
	warm: {
		id: 'warm',
		label: 'Warm',
		swatch: '#e9c9a3',
		// TODO(user): HDRI
		hdri: null,
		// TODO(user): exposure
		exposure: null,
		// TODO(user): lights
		lights: null,
		// TODO(user): background
		background: null,
	},
};

export const studioPresetList = Object.values(studioPresets);
