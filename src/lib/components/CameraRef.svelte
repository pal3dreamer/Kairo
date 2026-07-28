<script lang="ts">
	import { useThrelte } from '@threlte/core';
	import { onMount } from 'svelte';
	import type { PerspectiveCamera } from 'three';

	let { onref }: { onref: (c: PerspectiveCamera) => void } = $props();

	const { camera } = useThrelte();

	onMount(() => {
		onref(camera.current as PerspectiveCamera);
	});
</script>
