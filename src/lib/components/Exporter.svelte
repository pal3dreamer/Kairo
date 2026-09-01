<script lang="ts">
	import { useThrelte } from '@threlte/core';
	import { onMount } from 'svelte';
	import { WebGLRenderer, type PerspectiveCamera } from 'three';
	import {
		captureSceneToBlob,
		type ExportSettings,
		type ViewportSize,
		viewportSize,
	} from '$lib/export';

	let {
		onready,
	}: {
		onready: (
		capture: (settings: ExportSettings) => Promise<Blob>,
		getViewport: () => ViewportSize,
	) => void;
	} = $props();

	const { renderer, scene, camera } = useThrelte();
	const webglRenderer = renderer as WebGLRenderer;

	function getViewport(): ViewportSize {
		return viewportSize(webglRenderer);
	}

	async function capture(settings: ExportSettings): Promise<Blob> {
		const currentCamera = camera.current as PerspectiveCamera | undefined;
		if (!currentCamera) throw new Error('The camera is not ready yet.');
		return captureSceneToBlob(webglRenderer, scene, currentCamera, settings);
	}

	onMount(() => {
		onready(capture, getViewport);
	});
</script>
