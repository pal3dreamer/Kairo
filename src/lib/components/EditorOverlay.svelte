<script lang="ts">
	import { Scan } from '@lucide/svelte';
	import TopBar from './TopBar.svelte';
	import NavigationRail from './NavigationRail.svelte';
	import LeftPanel from './LeftPanel.svelte';
	import RightPanel from './RightPanel.svelte';
	import CanvasControls from './CanvasControls.svelte';
	import ExportModal from './ExportModal.svelte';
	import { getEditorState, type SceneObjectId } from '$lib/editor/state.svelte';
	import type { EditorDestination, EditorView } from '$lib/editor/ui';
	import { defaultCamera } from '$lib/renderer/presets';
	import { downloadProject, parseProject, type ProjectDocument, type Vec3 } from '$lib/editor/project';
	import type { ExportSettings, ViewportSize } from '$lib/export';

	// @ts-expect-error - three subpath exports aren't typed
	type OrbitControlsType = import('three/examples/jsm/controls/OrbitControls').OrbitControls;

	let {
		target,
		orbitControls,
		camera,
		onreset,
		onpreset,
		exportCapture,
		exportViewport,
	}: {
		target: import('three').Object3D | undefined;
		orbitControls: OrbitControlsType | undefined;
		camera: import('three').PerspectiveCamera | undefined;
		onreset?: () => void;
		onpreset?: (pos: [number, number, number]) => void;
		exportCapture?: (settings: ExportSettings) => Promise<Blob>;
		exportViewport?: () => ViewportSize;
	} = $props();

	const editor = getEditorState();

	let exportOpen = $state(false);
	let fileInput: HTMLInputElement | undefined = $state();
	let view = $state<EditorView>('scene');
	let panelOpen = $state(true);
	let inspectorOpen = $state(true);
	const destination = $derived<EditorDestination>(view === 'scene' ? 'scene' : 'assets');

	function createProject(): ProjectDocument {
		const config = editor.getConfig();
		const phone = capturePhone();
		const cam = captureCamera();
		return {
			version: 1,
			name: config.projectName,
			device: { model: editor.modelName, position: phone.position, rotation: phone.rotation, scale: phone.scale, material: config.material, bodyColorId: config.bodyColorId, customColor: config.customColor, screen: { source: editor.screenSrc, content: config.content }, shadow: config.shadow },
			camera: cam,
			studio: config.studio,
			hdri: config.hdri,
			exposure: config.exposure,
			background: config.background,
		};
	}

	function saveProject() {
		downloadProject(createProject());
	}

	function openProject() {
		fileInput?.click();
	}

	function handleProjectFile(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const project = parseProject(String(reader.result));
				editor.restoreConfig(project);
				if (target) {
					target.position.set(...(project.device.position as Vec3));
					target.rotation.set(...(project.device.rotation as Vec3));
					target.scale.set(...(project.device.scale as Vec3));
				}
				if (camera && orbitControls) {
					camera.position.set(...(project.camera.position as Vec3));
					orbitControls.target.set(...(project.camera.target as Vec3));
					orbitControls.update();
				}
				editor.setScreen(project.device.screen.source);
			} catch (error) {
				window.alert(error instanceof Error ? error.message : 'Could not open project');
			}
		};
		reader.readAsText(file);
		(event.currentTarget as HTMLInputElement).value = '';
	}

	function capturePhone(): { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number] } {
		if (!target) return { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };
		return {
			position: [target.position.x, target.position.y, target.position.z],
			rotation: [target.rotation.x, target.rotation.y, target.rotation.z],
			scale: [target.scale.x, target.scale.y, target.scale.z],
		};
	}

	function captureCamera(): { position: [number, number, number]; target: [number, number, number] } {
		return {
			position: camera ? [camera.position.x, camera.position.y, camera.position.z] : [0, 0, 0],
			target: orbitControls ? [orbitControls.target.x, orbitControls.target.y, orbitControls.target.z] : [0, 0, 0],
		};
	}

	function changeDestination(next: EditorDestination) {
		view = next === 'scene' ? 'scene' : 'media';
		panelOpen = true;
		if (next === 'assets') {
			editor.select('phone');
			inspectorOpen = true;
		}
	}

	function selectObject(id: SceneObjectId) {
		editor.select(id);
		inspectorOpen = true;
		if (id === 'background') view = 'backgrounds';
		else if (id === 'lights') view = 'lighting';
		else if (id === 'camera') view = 'camera';
		else view = 'scene';
	}

	function fitScene() {
		if (camera) {
			camera.fov = defaultCamera.fov;
			camera.updateProjectionMatrix();
		}
		onpreset?.(defaultCamera.position);
	}
</script>

<div class="editor-root">
	<TopBar
		onexport={() => (exportOpen = true)}
		onsave={saveProject}
		onopen={openProject}
		onnavigator={() => (panelOpen = !panelOpen)}
		oninspector={() => (inspectorOpen = !inspectorOpen)}
		{panelOpen}
		{inspectorOpen}
	/>
	<input bind:this={fileInput} class="hidden" type="file" accept=".kairo,application/json" onchange={handleProjectFile} />

	<div class="editor-workspace">
		<NavigationRail
			{destination}
			{panelOpen}
			onchange={changeDestination}
			ontogglepanel={() => (panelOpen = !panelOpen)}
		/>
		{#if panelOpen}
			<LeftPanel {view} {camera} {onpreset} onselect={selectObject} onclose={() => (panelOpen = false)} />
		{/if}

		<div class="canvas-space">
			<div class="canvas-stage">
				<div class="viewport-status">
					<Scan size={13} strokeWidth={1.65} />
					<span>Perspective</span>
				</div>
				<div class="canvas-hud"><CanvasControls {camera} onfit={fitScene} /></div>
			</div>
		</div>

		{#if inspectorOpen}
			<RightPanel
				{target}
				{camera}
				{onreset}
				onclose={() => (inspectorOpen = false)}
			/>
		{/if}
	</div>
</div>

{#if exportOpen}
	<ExportModal
		onclose={() => (exportOpen = false)}
		capture={exportCapture}
		getViewport={exportViewport}
		filename={editor.projectName}
	/>
{/if}

<style>
	.editor-root {
		pointer-events: none;
		position: absolute;
		z-index: 10;
		inset: 0;
		display: flex;
		min-width: 0;
		flex-direction: column;
	}

	.editor-workspace {
		position: relative;
		display: flex;
		min-width: 0;
		min-height: 0;
		flex: 1;
	}

	.canvas-space {
		position: relative;
		min-width: 140px;
		flex: 1;
		overflow: hidden;
		background:
			linear-gradient(var(--kairo-canvas-chrome), var(--kairo-canvas-chrome)) top / 100% 12px no-repeat,
			linear-gradient(var(--kairo-canvas-chrome), var(--kairo-canvas-chrome)) bottom / 100% 12px no-repeat,
			linear-gradient(var(--kairo-canvas-chrome), var(--kairo-canvas-chrome)) left / 12px 100% no-repeat,
			linear-gradient(var(--kairo-canvas-chrome), var(--kairo-canvas-chrome)) right / 12px 100% no-repeat;
	}

	.canvas-stage {
		position: absolute;
		z-index: 1;
		inset: 12px;
		border: 1px solid color-mix(in oklch, var(--kairo-divider) 88%, var(--kairo-ink-faint));
		border-radius: 7px;
		box-shadow: 0 2px 5px oklch(0.25 0.018 242 / 0.08);
		pointer-events: none;
	}



	.viewport-status {
		position: absolute;
		z-index: 10;
		left: 10px;
		top: 10px;
		display: flex;
		height: 27px;
		align-items: center;
		gap: 6px;
		padding: 0 8px;
		border: 1px solid var(--kairo-divider);
		border-radius: 4px;
		background: color-mix(in oklch, var(--kairo-panel-raised) 95%, transparent);
		box-shadow: 0 2px 7px oklch(0.25 0.018 242 / 0.08);
		color: var(--kairo-ink-secondary);
		font-size: 10px;
		font-weight: 600;
	}

	.canvas-hud {
		position: absolute;
		z-index: 20;
		left: 50%;
		bottom: 10px;
		transform: translateX(-50%);
	}

	@media (max-width: 760px) {
		.canvas-space {
			min-width: 0;
		}

		.canvas-stage {
			inset: 8px;
		}

		.canvas-hud {
			bottom: 8px;
		}
	}
</style>
