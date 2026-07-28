<script lang="ts">
	import { useThrelte, useTask } from '@threlte/core';
	import { onMount } from 'svelte';
	// @ts-expect-error - three subpath exports resolve at runtime via Vite
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
	// @ts-expect-error
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
	// @ts-expect-error
	import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
	import { Vector2 } from 'three';

	const { renderer, scene, camera, autoRender, renderStage } = useThrelte();

	let composer: EffectComposer | null = null;

	onMount(() => {
		autoRender.set(false);

		composer = new EffectComposer(renderer);
		composer.addPass(new RenderPass(scene, camera.current));

		const bloomPass = new UnrealBloomPass(
			new Vector2(window.innerWidth, window.innerHeight),
			0.04,
			0.3,
			0.95
		);
		composer.addPass(bloomPass);

		const onResize = () => {
			const w = window.innerWidth;
			const h = window.innerHeight;
			composer!.setSize(w, h);
		};

		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	useTask(() => {
		composer?.render();
	}, { stage: renderStage });
</script>
