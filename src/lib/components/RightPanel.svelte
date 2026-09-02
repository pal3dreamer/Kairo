<script lang="ts">
	import { PanelRightClose } from '@lucide/svelte';
	import { getEditorState } from '$lib/editor/state.svelte';
	import PhoneInspector from './inspectors/PhoneInspector.svelte';
	import BackgroundInspector from './inspectors/BackgroundInspector.svelte';
	import LightsInspector from './inspectors/LightsInspector.svelte';
	import CameraInspector from './inspectors/CameraInspector.svelte';
	import SceneInspector from './inspectors/SceneInspector.svelte';

	let {
		target,
		camera,
		onreset,
		onclose,
	}: {
		target: import('three').Object3D | undefined;
		camera: import('three').PerspectiveCamera | undefined;
		onreset?: () => void;
		onclose: () => void;
	} = $props();

	const editor = getEditorState();
	const title = $derived(
		editor.selection === 'phone'
			? editor.modelName
			: editor.selection === 'background'
				? 'Background'
				: editor.selection === 'lights'
					? 'Lighting'
					: editor.selection === 'camera'
						? 'Camera'
						: 'Scene',
	);
	const kind = $derived(
		editor.selection === 'phone'
			? 'Device'
			: editor.selection === 'background' || editor.selection === 'lights'
				? 'Environment'
				: editor.selection === 'camera'
					? 'View'
					: 'Project',
	);
</script>

<aside data-showcase="inspector" class="inspector-panel">
	<header class="inspector-header">
		<div class="inspector-heading">
			<span>Properties</span>
			<div class="title-line">
				<h2>{title}</h2>
				<small>{kind}</small>
			</div>
		</div>
		<button type="button" class="k-icon-button" title="Close properties" aria-label="Close properties" onclick={onclose}>
			<PanelRightClose size={15} strokeWidth={1.7} />
		</button>
	</header>

	<div data-showcase-scroll="inspector" class="inspector-scroll kairo-scrollbar">
		{#if editor.selection === 'phone'}
			<PhoneInspector {target} {onreset} />
		{:else if editor.selection === 'background'}
			<BackgroundInspector />
		{:else if editor.selection === 'lights'}
			<LightsInspector />
		{:else if editor.selection === 'camera'}
			<CameraInspector {camera} />
		{:else}
			<SceneInspector />
		{/if}
	</div>
</aside>

<style>
	.inspector-panel {
		pointer-events: auto;
		display: flex;
		width: 304px;
		min-width: 304px;
		height: 100%;
		flex-direction: column;
		overflow: hidden;
		border-left: 1px solid var(--kairo-divider);
		background: var(--kairo-panel);
	}

	.inspector-header {
		display: flex;
		height: 54px;
		min-height: 54px;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 0 10px 0 13px;
	}

	.inspector-heading {
		display: grid;
		min-width: 0;
		gap: 3px;
	}

	.inspector-heading > span {
		color: var(--kairo-ink-muted);
		font-size: 10px;
		font-weight: 600;
		line-height: 1;
		text-transform: uppercase;
	}

	.title-line {
		display: flex;
		min-width: 0;
		align-items: baseline;
		gap: 7px;
	}

	.title-line h2 {
		overflow: hidden;
		margin: 0;
		font-family: var(--font-display);
		font-size: 13px;
		font-weight: 600;
		line-height: 1.15;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.title-line small {
		color: var(--kairo-ink-faint);
		font-size: 10px;
	}

	.inspector-scroll {
		min-height: 0;
		flex: 1;
		overflow-x: hidden;
		overflow-y: auto;
	}

	@media (max-width: 1120px) {
		.inspector-panel {
			width: 286px;
			min-width: 286px;
		}
	}

	@media (max-width: 940px) {
		.inspector-panel {
			position: absolute;
			z-index: 35;
			right: 0;
			top: 0;
			bottom: 0;
			width: min(304px, calc(100vw - 48px));
			min-width: 0;
			box-shadow: -12px 0 24px oklch(0.25 0.018 242 / 0.12);
		}
	}
</style>
