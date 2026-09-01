<script lang="ts">
	import { useThrelte } from '@threlte/core';
	import { onMount } from 'svelte';
	// @ts-expect-error
	import { TransformControls as ThreeTransformControls } from 'three/examples/jsm/controls/TransformControls';
	// @ts-expect-error
	import type { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls';

	let {
		target,
		mode = 'none',
		orbitControls,
	}: {
		target: import('three').Object3D | undefined;
		mode: 'none' | 'translate' | 'rotate' | 'scale';
		orbitControls: ThreeOrbitControls | undefined;
	} = $props();

	const { scene, camera, renderer } = useThrelte();

	let controls: ThreeTransformControls | undefined = $state();

	onMount(() => {
		controls = new ThreeTransformControls(camera.current, renderer.domElement);
		controls.setSize(0.5);

		if (target && mode !== 'none') controls.attach(target);

		const helper = controls.getHelper();
		scene.add(helper);

		controls.addEventListener('dragging-changed', (event: { value: boolean }) => {
			if (orbitControls) {
				orbitControls.enabled = !event.value;
			}
		});

		return () => {
			controls.dispose();
			scene.remove(helper);
		};
	});

	$effect(() => {
		if (!controls) return;
		if (mode === 'none') {
			controls.detach();
		} else {
			controls.setMode(mode);
		}
	});

	$effect(() => {
		if (!controls || !target || mode === 'none') return;
		controls.attach(target);
	});
</script>
