<script lang="ts">
	import Section from '../fields/Section.svelte';
	import Slider from '../fields/Slider.svelte';
	import { poll } from '$lib/editor/poll';
	import { cameraPresets, defaultCamera } from '$lib/renderer/presets';
	import type { PerspectiveCamera } from 'three';

	let {
		camera,
		onpreset,
	}: {
		camera: PerspectiveCamera | undefined;
		onpreset?: (pos: [number, number, number]) => void;
	} = $props();

	let fov = $state(defaultCamera.fov);
	let zoom = $state(1);

	function reset() {
		if (!camera) return;
		camera.position.set(...defaultCamera.position);
		camera.fov = defaultCamera.fov;
		camera.zoom = 1;
		camera.updateProjectionMatrix();
	}

	poll(
		() => (camera ? { fov: camera.fov, zoom: camera.zoom } : null),
		(v) => {
			fov = v.fov;
			zoom = v.zoom;
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

<Section title="Preset" open={true}>
	<div class="grid grid-cols-2 gap-1.5">
		{#each cameraPresets as p}
			<button
				class="rounded-md border border-gray-200 px-2.5 py-2 text-[12px] font-medium text-neutral-600 transition-colors hover:border-neutral-400 hover:text-neutral-900"
				onclick={() => onpreset?.(p.position)}
			>
				{p.label}
			</button>
		{/each}
		<button
			class="col-span-2 rounded-md border border-gray-200 px-2.5 py-2 text-[12px] font-medium text-neutral-600 transition-colors hover:bg-gray-100"
			onclick={reset}
		>
			Reset View
		</button>
	</div>
</Section>

<Section title="Lens">
	<div class="space-y-2.5">
		<Slider label="FOV" min={15} max={60} step={1} value={fov} format={(v) => `${Math.round(v)}°`} onchange={(v) => (fov = v)} />
		<Slider label="Zoom" min={0.5} max={3} step={0.05} value={zoom} format={(v) => `${v.toFixed(2)}×`} onchange={(v) => (zoom = v)} />
	</div>
</Section>