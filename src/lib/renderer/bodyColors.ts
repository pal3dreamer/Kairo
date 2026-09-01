import type { BodyColor, BodyColorId } from './types';

/**
 * Body colors — the tint applied to the body materials.
 * The surface response (metalness / roughness) is separate and lives in
 * `./materialPresets.ts`.
 */
export const bodyColors: Record<BodyColorId, BodyColor> = {
	silver: { id: 'silver', label: 'Silver', hex: '#d4d4d4' },
	titanium: { id: 'titanium', label: 'Titanium', hex: '#a09c96' },
	black: { id: 'black', label: 'Black', hex: '#2e2e33' },
	blue: { id: 'blue', label: 'Blue', hex: '#46668d' },
	clay: { id: 'clay', label: 'Clay', hex: '#b0957d' },
	custom: { id: 'custom', label: 'Custom', hex: '#d4d4d4' },
};

export const bodyColorList = Object.values(bodyColors);
