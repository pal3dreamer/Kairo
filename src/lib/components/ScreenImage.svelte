<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { CanvasTexture, TextureLoader, Color, type MeshStandardMaterial, type Texture } from 'three';
	import type { ContentConfig } from '$lib/editor/state.svelte';

	/**
	 * The visible screen area of the iPhone 12 Pro, in width/height units.
	 * Used to compute Fit / Fill behaviour for the content texture.
	 */
	const SCREEN_ASPECT = 1170 / 2532;

	let {
		material,
		src = '',
		content,
	}: {
		material: MeshStandardMaterial;
		src?: string;
		content: ContentConfig;
	} = $props();

	let imageAspect = $state(1);
	// Three.js textures are mutable renderer objects. Keep the reference reactive
	// without deep-proxying texture internals such as repeat and needsUpdate.
	let currentTexture = $state.raw<Texture>();

	const adjusted = new WeakMap<MeshStandardMaterial, { uniforms: Record<string, { value: number }> }>();
	const textureLoader = new TextureLoader();

	function createPlaceholder(): CanvasTexture {
		const canvas = document.createElement('canvas');
		canvas.width = 1170;
		canvas.height = 2532;
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

	function applyTransform(texture: import('three').Texture) {
		const a = imageAspect;
		const s = SCREEN_ASPECT;
		let rx = 1;
		let ry = 1;

		// repeat.x / repeat.y must equal a/s to preserve the image's aspect on screen.
		if (content.fit === 'stretch') {
			rx = ry = 1;
		} else if (content.fit === 'fit') {
			if (a >= s) {
				rx = 1;
				ry = a / s;
			} else {
				rx = s / a;
				ry = 1;
			}
		} else {
			// fill / cover — crop the overflow
			if (a >= s) {
				rx = s / a;
				ry = 1;
			} else {
				rx = 1;
				ry = a / s;
			}
		}

		texture.repeat.set(rx * content.scale, ry * content.scale);
		texture.offset.set(content.offsetX, content.offsetY);
		texture.center.set(0.5, 0.5);
		texture.rotation = (content.rotation * Math.PI) / 180;
		// Three.js refreshes the UV matrix during rendering. Marking this texture
		// dirty would re-upload the full image for every slider event.
	}

	function applyTexture(texture: import('three').Texture) {
		if (currentTexture && currentTexture !== texture) currentTexture.dispose();
		currentTexture = texture;
		const img = texture.image as { width?: number; height?: number };
		imageAspect = img?.width && img?.height ? img.width / img.height : 1;

		material.color.set('#ffffff');
		material.map = texture;
		material.metalness = 0;
		material.roughness = 1;
		material.envMapIntensity = 0;
		material.emissive = new Color(0xffffff);
		material.emissiveIntensity = 0.25;
		material.emissiveMap = texture;
		material.needsUpdate = true;
		applyTransform(texture);
		applyAdjustments();
	}

	function applyAdjustments() {
		const brightness = content.brightness;
		const contrast = content.contrast;
		const saturation = content.saturation;

		if (!adjusted.has(material)) {
			adjusted.set(material, { uniforms: {} });
			material.customProgramCacheKey = () => 'kairo-screen-fx';
			material.onBeforeCompile = (shader) => {
				shader.uniforms.uBrightness = { value: content.brightness };
				shader.uniforms.uContrast = { value: content.contrast };
				shader.uniforms.uSaturation = { value: content.saturation };
				shader.fragmentShader = shader.fragmentShader.replace(
					'#include <map_fragment>',
					`
					#ifdef USE_MAP
					vec4 texelColor = texture2D(map, vMapUv);
					texelColor.rgb = mix(vec3(0.5), texelColor.rgb, uContrast);
					float kairoLuma = dot(texelColor.rgb, vec3(0.299, 0.587, 0.114));
					texelColor.rgb = mix(vec3(kairoLuma), texelColor.rgb, uSaturation);
					texelColor.rgb *= uBrightness;
					diffuseColor *= texelColor;
					#endif
					`,
				);
				shader.fragmentShader =
					'uniform float uBrightness;\nuniform float uContrast;\nuniform float uSaturation;\n' +
					shader.fragmentShader;
				adjusted.get(material)!.uniforms = shader.uniforms;
			};
		}
		const { uniforms } = adjusted.get(material)!;
		if (uniforms.uBrightness) {
			uniforms.uBrightness.value = brightness;
			uniforms.uContrast.value = contrast;
			uniforms.uSaturation.value = saturation;
		}
	}

	$effect(() => {
		if (currentTexture) applyTransform(currentTexture);
	});

	$effect(() => {
		if (material) applyAdjustments();
	});

	$effect(() => {
		const source = src;
		let cancelled = false;

		// Loading a texture is an imperative side effect. Keep its internal state
		// out of this effect's dependency graph so replacing the texture cannot
		// schedule the effect again.
		untrack(() => {
			if (source) {
				textureLoader.load(source, (texture) => {
					if (cancelled) {
						texture.dispose();
						return;
					}
					texture.colorSpace = 'srgb';
					applyTexture(texture);
				});
			} else {
				applyTexture(createPlaceholder());
			}
		});

		return () => {
			cancelled = true;
		};
	});

	onDestroy(() => {
		currentTexture?.dispose();
		currentTexture = undefined;
	});
</script>
