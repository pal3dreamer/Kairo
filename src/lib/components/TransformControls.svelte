<script lang="ts">
	import { useThrelte } from '@threlte/core';
	import { onMount } from 'svelte';
	// @ts-expect-error
	import { TransformControls as ThreeTransformControls } from 'three/examples/jsm/controls/TransformControls';

	let {
		target,
		mode = 'translate',
		orbitControls,
	}: {
		target: import('three').Object3D | undefined;
		mode: 'translate' | 'rotate' | 'scale';
		orbitControls: import('three/examples/jsm/controls/OrbitControls').OrbitControls | undefined;
	} = $props();

	const { scene, camera, renderer } = useThrelte();

	let controls: ThreeTransformControls | undefined = $state();

	onMount(() => {
		controls = new ThreeTransformControls(camera.current, renderer.domElement);
		controls.setSize(0.5);

		if (target) controls.attach(target);

		const helper = controls.getHelper();
		scene.add(helper);

		controls.addEventListener('dragging-changed', (event) => {
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
		controls.setMode(mode);
	});

	$effect(() => {
		if (!controls || !target) return;
		controls.attach(target);
	});
</script>
