<script lang="ts">
	import { useThrelte } from '@threlte/core';
	import { onMount } from 'svelte';
	import {
		CanvasTexture,
		Color,
		SRGBColorSpace,
		Texture,
		TextureLoader,
		type ColorRepresentation,
	} from 'three';
	import type { BackgroundConfig } from '$lib/renderer/types';

	let { config }: { config: BackgroundConfig } = $props();

	const { renderer, scene } = useThrelte();

	let current: Texture | Color | null = null;

	function dispose() {
		if (current instanceof Texture) current.dispose();
		current = null;
	}

	function setSolid(color: ColorRepresentation) {
		dispose();
		current = new Color(color);
		scene.background = current;
	}

	function setGradient(top: string, bottom: string, angle: number, spread: number) {
		dispose();
		const canvas = document.createElement('canvas');
		canvas.width = 512;
		canvas.height = 512;
		const ctx = canvas.getContext('2d')!;
		const radians = ((angle - 90) * Math.PI) / 180;
		const radius = Math.abs(canvas.width * Math.cos(radians)) + Math.abs(canvas.height * Math.sin(radians));
		const dx = (Math.cos(radians) * radius) / 2;
		const dy = (Math.sin(radians) * radius) / 2;
		const center = canvas.width / 2;
		const gradient = ctx.createLinearGradient(center - dx, center - dy, center + dx, center + dy);
		const transition = Math.max(0.08, Math.min(1, spread));
		const topStop = (1 - transition) / 2;
		const bottomStop = 1 - topStop;
		gradient.addColorStop(0, top);
		if (topStop > 0) gradient.addColorStop(topStop, top);
		if (bottomStop < 1) gradient.addColorStop(bottomStop, bottom);
		gradient.addColorStop(1, bottom);
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		const texture = new CanvasTexture(canvas);
		texture.colorSpace = SRGBColorSpace;
		current = texture;
		scene.background = texture;
	}

	function setTransparent() {
		dispose();
		renderer.setClearColor(0x000000, 0);
		scene.background = null;
	}

	function setImage(url: string) {
		dispose();
		new TextureLoader().load(url, (texture) => {
			texture.colorSpace = SRGBColorSpace;
			current = texture;
			scene.background = texture;
		});
	}

	$effect(() => {
		switch (config.type) {
			case 'solid':
				setSolid(config.solidColor ?? '#ffffff');
				break;
			case 'gradient':
				setGradient(
					config.gradientTop ?? '#ececec',
					config.gradientBottom ?? '#f8f8f8',
					config.gradientAngle ?? 180,
					config.gradientSpread ?? 1,
				);
				break;
			case 'transparent':
				setTransparent();
				break;
			case 'image':
				if (config.imageUrl) setImage(config.imageUrl);
				break;
		}
	});

	onMount(() => {
		return () => {
			dispose();
		};
	});
</script>
