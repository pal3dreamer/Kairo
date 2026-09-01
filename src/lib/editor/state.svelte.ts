import { setContext, getContext } from 'svelte';
import type {
	BackgroundConfig,
	BodyColorId,
	MaterialPresetId,
	StudioPresetId,
} from '$lib/renderer/types';
import { defaultBackground, defaultExposure, defaultHdri } from '$lib/renderer/defaults';
import { studioPresets } from '$lib/renderer/studioPresets';
import type { ProjectDocument } from './project';

export type SceneObjectId = 'phone' | 'background' | 'lights' | 'camera';
export type TransformMode = 'none' | 'translate' | 'rotate' | 'scale';

type ContentFit = 'fit' | 'fill' | 'stretch';

export type ContentConfig = {
	fit: ContentFit;
	scale: number;
	rotation: number;
	offsetX: number;
	offsetY: number;
	brightness: number;
	contrast: number;
	saturation: number;
};

const defaultContent: ContentConfig = {
	fit: 'fit',
	scale: 1,
	rotation: 0,
	offsetX: 0,
	offsetY: 0,
	brightness: 1,
	contrast: 1,
	saturation: 1,
};

export type ShadowConfig = {
	opacity: number;
	blur: number;
	distance: number;
};

const defaultShadow: ShadowConfig = {
	opacity: 0.25,
	blur: 4,
	distance: 3,
};

export const MODEL_URL = '/models/iphone_12_pro.glb';

function modelNameFromUrl(url: string): string {
	const base = (url.split('/').pop() ?? url).replace(/\.(glb|gltf)$/i, '');
	return base
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

const EDITOR_CONTEXT = Symbol('kairo-editor');

/**
 * Single source of truth for everything the editor edits: selection, layout,
 * and the whole scene configuration (background, material, lights, content...).
 * Components read and write this store directly instead of prop-drilling.
 */
export function provideEditorState() {
	let selection = $state<SceneObjectId | null>(null);
	let transformMode = $state<TransformMode>('none');

	let screenSrc = $state('');
	let studio = $state<StudioPresetId>('soft');
	let background = $state<BackgroundConfig>({ ...defaultBackground });
	let material = $state<MaterialPresetId>('metal');
	let bodyColorId = $state<BodyColorId>('silver');
	let customColor = $state('#d4d4d4');
	let exposure = $state(defaultExposure);
	let hdri = $state(defaultHdri);
	let content = $state<ContentConfig>({ ...defaultContent });
	let shadow = $state<ShadowConfig>({ ...defaultShadow });
	let projectName = $state('Untitled Project');

	const modelName = modelNameFromUrl(MODEL_URL);

	return setContext(EDITOR_CONTEXT, {
		get selection() {
			return selection;
		},
		get transformMode() {
			return transformMode;
		},
		get screenSrc() {
			return screenSrc;
		},
		get studio() {
			return studio;
		},
		get background() {
			return background;
		},
		get material() {
			return material;
		},
		get bodyColorId() {
			return bodyColorId;
		},
		get customColor() {
			return customColor;
		},
		get exposure() {
			return exposure;
		},
		get hdri() {
			return hdri;
		},
		get content() {
			return content;
		},
		get shadow() {
			return shadow;
		},
		get modelName() {
			return modelName;
		},
		get projectName() {
			return projectName;
		},

		select(id: SceneObjectId | null) {
			selection = id;
		},
		setTransform(m: TransformMode) {
			transformMode = m;
		},
		setScreen(src: string) {
			screenSrc = src;
		},
		clearScreen() {
			screenSrc = '';
		},
		setStudio(id: StudioPresetId) {
			studio = id;
			const preset = studioPresets[id];
			if (preset.background) background = { ...preset.background };
		},
		setBackground(config: BackgroundConfig) {
			background = config;
		},
		setMaterial(id: MaterialPresetId) {
			material = id;
		},
		setBodyColor(id: BodyColorId) {
			bodyColorId = id;
		},
		setCustomColor(hex: string) {
			customColor = hex;
		},
		setExposure(v: number) {
			exposure = v;
		},
		setHdri(url: string) {
			hdri = url;
		},
		setContent(config: ContentConfig) {
			content = config;
		},
		setShadow(config: ShadowConfig) {
			shadow = config;
		},
		setProjectName(name: string) {
			projectName = name.trim() || 'Untitled Project';
		},
		getConfig() {
			return { projectName, studio, background: { ...background }, material, bodyColorId, customColor, exposure, hdri, content: { ...content }, shadow: { ...shadow } };
		},
		restoreConfig(config: ProjectDocument) {
			projectName = config.name || 'Untitled Project';
			studio = config.studio;
			background = { ...config.background };
			material = config.device.material;
			bodyColorId = config.device.bodyColorId;
			customColor = config.device.customColor;
			exposure = config.exposure;
			hdri = config.hdri;
			content = { ...config.device.screen.content };
			shadow = { ...config.device.shadow };
		},
	});
}

export function getEditorState() {
	return getContext<ReturnType<typeof provideEditorState>>(EDITOR_CONTEXT);
}
