<script lang="ts">
	import { useThrelte } from '@threlte/core';
	import { SRGBColorSpace, CanvasTexture } from 'three';

	const { renderer, scene } = useThrelte();

	renderer.toneMappingExposure = 0.8;

	const canvas = document.createElement('canvas');
	canvas.width = 1;
	canvas.height = 512;
	const ctx = canvas.getContext('2d')!;

	const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
	gradient.addColorStop(0, '#ececec');
	gradient.addColorStop(1, '#f8f8f8');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	scene.background = texture;
</script>
