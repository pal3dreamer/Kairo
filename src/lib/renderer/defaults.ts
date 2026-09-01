import type { BackgroundConfig, StudioLight } from './types';

/**
 * Default renderer setup used while studio presets are still placeholders.
 * These are the values the scene shipped with before Phase 2; they are NOT
 * presets — they only keep the scene rendering until real presets arrive.
 */
export const defaultHdri = '/environments/studio_small_08_1k.exr';

export const defaultExposure = 0.8;

export const defaultLights: StudioLight[] = [
	{
		key: 'key',
		type: 'rect',
		position: [4, 3, 2],
		rotation: [-0.4, 0.6, 0],
		color: '#ffeecc',
		intensity: 4,
		width: 3,
		height: 1.5,
	},
	{
		key: 'fill',
		type: 'rect',
		position: [-3, 2, -1],
		rotation: [0.2, -0.8, 0.1],
		color: '#ccddff',
		intensity: 2,
		width: 2,
		height: 1,
	},
];

export const defaultBackground: BackgroundConfig = {
	type: 'gradient',
	gradientTop: '#ececec',
	gradientBottom: '#f8f8f8',
};
