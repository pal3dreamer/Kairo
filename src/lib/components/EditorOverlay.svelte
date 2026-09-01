<script lang="ts">
	import TopBar from './TopBar.svelte';
	import LeftPanel from './LeftPanel.svelte';
	import RightPanel from './RightPanel.svelte';
	import ExportModal from './ExportModal.svelte';
	import { getEditorState } from '$lib/editor/state.svelte';
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
		if (!target) {
			return { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };
		}
		return {
			position: [target.position.x, target.position.y, target.position.z],
			rotation: [target.rotation.x, target.rotation.y, target.rotation.z],
			scale: [target.scale.x, target.scale.y, target.scale.z],
		};
	}

	function captureCamera(): { position: [number, number, number]; target: [number, number, number] } {
		const position: [number, number, number] = camera
			? [camera.position.x, camera.position.y, camera.position.z]
			: [0, 0, 0];
		const camTarget: [number, number, number] = orbitControls
			? [orbitControls.target.x, orbitControls.target.y, orbitControls.target.z]
			: [0, 0, 0];
		return { position, target: camTarget };
	}

</script>

<div class="absolute inset-0 z-10 flex flex-col pointer-events-none">
	<TopBar onexport={() => (exportOpen = true)} onsave={saveProject} onopen={openProject} />
	<input bind:this={fileInput} class="hidden" type="file" accept=".kairo,application/json" onchange={handleProjectFile} />

	<div class="flex min-h-0 flex-1">
		<LeftPanel />
		<div class="min-w-0 flex-1"></div>
		<RightPanel {target} {camera} {onreset} {onpreset} />
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
