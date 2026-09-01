<script lang="ts">
	import { RotateCcw } from '@lucide/svelte';
	import Section from '../fields/Section.svelte';
	import Slider from '../fields/Slider.svelte';
	import { poll } from '$lib/editor/poll';
	import { defaultCamera } from '$lib/renderer/presets';
	import type { PerspectiveCamera } from 'three';

	let {
		camera,
	}: {
		camera: PerspectiveCamera | undefined;
	} = $props();

	let fov = $state(defaultCamera.fov);
	let zoom = $state(1);
	function resetLens() {
		if (!camera) return;
		camera.fov = defaultCamera.fov;
		camera.zoom = 1;
		camera.updateProjectionMatrix();
	}

	poll(
		() => camera
			? {
				fov: camera.fov,
				zoom: camera.zoom,
			}
			: null,
		(value) => {
			fov = value.fov;
			zoom = value.zoom;
		},
	);

	$effect(() => {
		if (!camera) return;
		camera.fov = fov;
		camera.updateProjectionMatrix();
	});

	$effect(() => {
		if (!camera) return;
		camera.zoom = zoom;
		camera.updateProjectionMatrix();
	});
</script>

<Section title="Lens" open={true} summary={`${Math.round(fov)}°`} showcaseId="lens">
	<div class="control-list">
		<Slider label="Field of view" min={15} max={60} step={1} value={fov} format={(value) => `${Math.round(value)}°`} onchange={(value) => (fov = value)} />
		<Slider label="Zoom" min={0.5} max={3} step={0.05} value={zoom} format={(value) => `${value.toFixed(2)}x`} onchange={(value) => (zoom = value)} />
	</div>
	<button type="button" class="reset-lens" onclick={resetLens}>
		<RotateCcw size={13} strokeWidth={1.7} />
		Reset lens
	</button>
</Section>

<style>
	.reset-lens {
		display: flex;
		height: 29px;
		width: 100%;
		align-items: center;
		justify-content: center;
		gap: 6px;
		margin-top: 8px;
		border: 1px solid var(--kairo-divider);
		border-radius: 4px;
		background: transparent;
		color: var(--kairo-ink-secondary);
		font-size: 11px;
		font-weight: 600;
	}

	.reset-lens:hover {
		background: var(--kairo-field);
		color: var(--kairo-ink);
	}

	.control-list {
		display: grid;
		gap: 2px;
	}
</style>
