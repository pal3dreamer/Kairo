export type StudioPresetId = 'soft' | 'hard' | 'apple' | 'dark' | 'warm';

export type BackgroundType = 'solid' | 'gradient' | 'transparent' | 'image';

export type MaterialPresetId = 'metal' | 'matte' | 'glossy' | 'satin' | 'brushed';

export type BodyColorId = 'silver' | 'titanium' | 'black' | 'blue' | 'clay' | 'custom';

export type BackgroundConfig = {
	type: BackgroundType;
	solidColor?: string;
	gradientTop?: string;
	gradientBottom?: string;
	imageUrl?: string;
};

export type StudioLight = {
	key: string;
	type: 'rect' | 'directional' | 'point';
	position: [number, number, number];
	rotation?: [number, number, number];
	color: string;
	intensity: number;
	width?: number;
	height?: number;
};

export type StudioPreset = {
	id: StudioPresetId;
	label: string;
	/** Accent color used in the UI. */
	swatch: string;
	/** `null` until the user provides real presets. */
	hdri: string | null;
	/** `null` until the user provides real presets. */
	exposure: number | null;
	/** `null` until the user provides real presets. */
	lights: StudioLight[] | null;
	/** `null` until the user provides real presets. */
	background: BackgroundConfig | null;
};

export type MaterialPreset = {
	id: MaterialPresetId;
	label: string;
	/**
	 * Surface response (metalness / roughness / env map) keyed by material name,
	 * applied to the body materials of the object.
	 * Not every GLB exposes every material name; unknown names are simply skipped.
	 */
	surfaces: Record<string, Partial<import('three').MeshStandardMaterial>>;
};

export type BodyColor = {
	id: BodyColorId;
	label: string;
	hex: string;
};
