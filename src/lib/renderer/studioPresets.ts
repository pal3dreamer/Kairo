import type { StudioPreset, StudioPresetId } from './types';

export const studioPresets: Record<StudioPresetId, StudioPreset> = {
	soft: {
		id: 'soft',
		label: 'Soft Studio',
		swatch: '#d6d9dc',
		hdri: '/environments/studio_small_08_1k.exr',
		exposure: 0.8,
		lights: [
			{ key: 'soft-key', type: 'rect', position: [4, 3, 2], rotation: [-0.4, 0.6, 0], color: '#fff1d9', intensity: 4, width: 3.5, height: 2.2 },
			{ key: 'soft-fill', type: 'rect', position: [-3, 2, -1], rotation: [0.2, -0.8, 0.1], color: '#dbe7ff', intensity: 2.2, width: 3, height: 1.8 },
		],
		background: null,
	},
	hard: {
		id: 'hard',
		label: 'Hard Studio',
		swatch: '#555a60',
		hdri: '/environments/studio_small_08_4k.exr',
		exposure: 0.68,
		lights: [
			{ key: 'hard-key', type: 'rect', position: [4.5, 4, 1.5], rotation: [-0.55, 0.72, 0], color: '#fff4df', intensity: 7.5, width: 1.2, height: 2.8 },
			{ key: 'hard-fill', type: 'directional', position: [-4, 1, -2], color: '#c7d8ff', intensity: 0.8 },
		],
		background: null,
	},
	apple: {
		id: 'apple',
		label: 'Product White',
		swatch: '#f0f1f2',
		hdri: '/environments/studio_small_08_1k.exr',
		exposure: 0.96,
		lights: [
			{ key: 'product-key', type: 'rect', position: [4, 5, 4], rotation: [-0.65, 0.52, 0], color: '#fffdf8', intensity: 5.2, width: 4.5, height: 4 },
			{ key: 'product-fill', type: 'rect', position: [-4, 2, 1], rotation: [0.1, -0.9, 0], color: '#e4ecff', intensity: 3.1, width: 3.5, height: 3 },
			{ key: 'product-rim', type: 'point', position: [0, 3, -4], color: '#ffffff', intensity: 1.4 },
		],
		background: null,
	},
	dark: {
		id: 'dark',
		label: 'Edge Light',
		swatch: '#20242a',
		hdri: '/environments/studio_small_08_4k.exr',
		exposure: 0.54,
		lights: [
			{ key: 'edge-key', type: 'rect', position: [3.5, 2.5, -2.5], rotation: [-0.2, 2.15, 0], color: '#d4e0ff', intensity: 6.2, width: 1.1, height: 3.8 },
			{ key: 'edge-fill', type: 'rect', position: [-3.5, 1.5, 2], rotation: [0.1, -0.95, 0], color: '#ffd9c4', intensity: 1.4, width: 2, height: 3 },
		],
		background: null,
	},
	warm: {
		id: 'warm',
		label: 'Warm Studio',
		swatch: '#d9b58b',
		hdri: '/environments/ferndale_studio_07_1k.exr',
		exposure: 0.88,
		lights: [
			{ key: 'warm-key', type: 'rect', position: [3.5, 3.5, 2.5], rotation: [-0.5, 0.65, 0], color: '#ffd7aa', intensity: 4.8, width: 3.2, height: 2.4 },
			{ key: 'warm-fill', type: 'rect', position: [-3, 2, -1.5], rotation: [0.2, -0.8, 0], color: '#d8e4ff', intensity: 1.6, width: 2.6, height: 2 },
		],
		background: null,
	},
};

export const studioPresetList = Object.values(studioPresets);
