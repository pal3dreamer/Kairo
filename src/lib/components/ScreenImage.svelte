<script lang="ts">
	import { CanvasTexture, TextureLoader, Color, type MeshStandardMaterial } from 'three';

	let {
		material,
		src = '',
	}: { material: MeshStandardMaterial; src?: string } = $props();

	function createPlaceholder(): CanvasTexture {
		const canvas = document.createElement('canvas');
		canvas.width = 2340;
		canvas.height = 1080;
		const ctx = canvas.getContext('2d')!;

		const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
		gradient.addColorStop(0, '#667eea');
		gradient.addColorStop(0.5, '#764ba2');
		gradient.addColorStop(1, '#f093fb');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		for (let i = 0; i < 12; i++) {
			const x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
			const y = Math.random() * canvas.height * 0.6 + canvas.height * 0.1;
			const r = Math.random() * 30 + 10;
			ctx.beginPath();
			ctx.arc(x, y, r, 0, Math.PI * 2);
			ctx.fillStyle = `hsla(${Math.random() * 360}, 70%, 60%, 0.3)`;
			ctx.fill();
		}

		const texture = new CanvasTexture(canvas);
		texture.colorSpace = 'srgb';
		return texture;
	}

	function applyTexture(texture: import('three').Texture) {
		material.map = texture;
		material.emissive = new Color(0xffffff);
		material.emissiveIntensity = 0.15;
		material.emissiveMap = texture;
		material.needsUpdate = true;
	}

	$effect(() => {
		if (src) {
			new TextureLoader().load(src, (texture) => {
				texture.colorSpace = 'srgb';
				applyTexture(texture);
			});
		} else {
			applyTexture(createPlaceholder());
		}
	});
</script>
