import type { BackgroundConfig, BodyColorId, MaterialPresetId, StudioPresetId } from '$lib/renderer/types';
import type { ContentConfig, ShadowConfig } from './state.svelte';

export type Vec3 = [number, number, number];

export type ProjectDocument = {
	version: 1;
	name: string;
	device: {
		model: string;
		position: Vec3;
		rotation: Vec3;
		scale: Vec3;
		material: MaterialPresetId;
		bodyColorId: BodyColorId;
		customColor: string;
		screen: { source: string; content: ContentConfig };
		shadow: ShadowConfig;
	};
	camera: { position: Vec3; target: Vec3 };
		studio: StudioPresetId;
		hdri: string;
		exposure: number;
	background: BackgroundConfig;
};

export function parseProject(text: string): ProjectDocument {
	const value: unknown = JSON.parse(text);
	if (!value || typeof value !== 'object' || (value as { version?: unknown }).version !== 1) {
		throw new Error('Unsupported or invalid Kairo project file');
	}
	const project = value as Partial<ProjectDocument>;
	if (!project.device || !project.camera || !project.background) {
		throw new Error('Kairo project file is missing required scene data');
	}
	return value as ProjectDocument;
}

export function downloadProject(project: ProjectDocument) {
	const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = `${project.name || 'kairo-project'}.kairo`;
	anchor.click();
	URL.revokeObjectURL(url);
}
