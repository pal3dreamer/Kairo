import type { BackgroundConfig, MaterialPresetId } from './types';

/**
 * Quick background presets shown in the Background inspector. `config` is the
 * full BackgroundConfig to apply; swatches are only a UI hint.
 */
export const backgroundPresets: { id: string; label: string; swatch: string; config: BackgroundConfig }[] = [
	{ id: 'white', label: 'White', swatch: '#ffffff', config: { type: 'solid', solidColor: '#ffffff' } },
	{ id: 'gray', label: 'Gray', swatch: '#e4e4e7', config: { type: 'solid', solidColor: '#e4e4e7' } },
	{
		id: 'light',
		label: 'Light',
		swatch: '#ececec',
		config: { type: 'gradient', gradientTop: '#ececec', gradientBottom: '#f8f8f8' },
	},
	{
		id: 'dark',
		label: 'Dark',
		swatch: '#2a2a30',
		config: { type: 'gradient', gradientTop: '#2a2a30', gradientBottom: '#16161a' },
	},
	{ id: 'warm', label: 'Warm', swatch: '#efe3d0', config: { type: 'solid', solidColor: '#efe3d0' } },
	{
		id: 'none',
		label: 'None',
		swatch: 'linear-gradient(135deg,#fff 50%,#bbb 50%)',
		config: { type: 'transparent' },
	},
];

/** HDR environment options shown in the Lights inspector. */
export const hdriOptions: { id: string; label: string; url: string }[] = [
	{ id: 'studio-1k', label: 'Studio 1K', url: '/environments/studio_small_08_1k.exr' },
	{ id: 'studio-4k', label: 'Studio 4K', url: '/environments/studio_small_08_4k.exr' },
	{ id: 'ferndale', label: 'Ferndale', url: '/environments/ferndale_studio_07_1k.exr' },
];

/** The scene's default camera placement — the single source for Scene and the Camera inspector reset. */
export const defaultCamera = {
	position: [2.5, 1.75, 3.45] as [number, number, number],
	fov: 24,
};

export const cameraPresets: { label: string; position: [number, number, number] }[] = [
	{ label: 'Front', position: [0, 0, 8] },
	{ label: '\u00be Front', position: [2.5, 1.75, 3.45] },
	{ label: 'Side', position: [8, 0, 0] },
	{ label: 'Top', position: [0, 8, 0.1] },
	{ label: 'Perspective', position: [6, 4, 6] },
];

/**
 * User-facing body finishes mapped directly to material presets.
 * "Polished" is implemented by the `glossy` preset, "Chrome" by the `metal` preset.
 */
export const finishOptions: { id: MaterialPresetId; label: string }[] = [
	{ id: 'matte', label: 'Matte' },
	{ id: 'satin', label: 'Satin' },
	{ id: 'brushed', label: 'Brushed' },
	{ id: 'glossy', label: 'Polished' },
	{ id: 'metal', label: 'Chrome' },
];
