<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import type { StudioPreset } from '$lib/renderer/types';
	import { defaultExposure, defaultLights } from '$lib/renderer/defaults';

	let {
		preset,
		exposure,
	}: { preset: StudioPreset; exposure?: number } = $props();

	const { renderer } = useThrelte();

	const lights = $derived(preset.lights ?? defaultLights);

	$effect(() => {
		renderer.toneMappingExposure = exposure ?? preset.exposure ?? defaultExposure;
	});
</script>

{#each lights as light (light.key)}
	{#if light.type === 'rect'}
		<T.RectAreaLight
			position={light.position}
			rotation={light.rotation}
			width={light.width}
			height={light.height}
			color={light.color}
			intensity={light.intensity}
		/>
	{:else if light.type === 'directional'}
		<T.DirectionalLight position={light.position} color={light.color} intensity={light.intensity} />
	{:else}
		<T.PointLight position={light.position} color={light.color} intensity={light.intensity} />
	{/if}
{/each}
