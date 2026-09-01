<script lang="ts">
	import { browser } from '$app/environment';
	import { Canvas, T, extend } from '@threlte/core';
	import Background from './Background.svelte';
	import { OrbitControls, GLTF, Environment, ContactShadows } from '@threlte/extras';
	import {
		ACESFilmicToneMapping,
		Color,
		Mesh,
		MeshStandardMaterial,
		RectAreaLight,
		WebGLRenderer,
		type Group,
		type PerspectiveCamera,
		type Texture,
	} from 'three';
	// @ts-expect-error
	import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
	// @ts-expect-error
	import type { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	import ScreenImage from './ScreenImage.svelte';
	import TransformControls from './TransformControls.svelte';
	import CameraRef from './CameraRef.svelte';
	import EditorOverlay from './EditorOverlay.svelte';
	import LightRig from './LightRig.svelte';
	import Exporter from './Exporter.svelte';
	import { surfaces } from '$lib/renderer/surfaces';
	import {
		isBodyMesh,
		isFrontMesh,
		isLogoMesh,
		materialPresets,
	} from '$lib/renderer/materialPresets';
	import { bodyColors } from '$lib/renderer/bodyColors';
	import { studioPresets } from '$lib/renderer/studioPresets';
	import { defaultCamera } from '$lib/renderer/presets';
	import { MODEL_URL, provideEditorState } from '$lib/editor/state.svelte';
	import type { ExportSettings, ViewportSize } from '$lib/export';

	RectAreaLightUniformsLib.init();

	extend({ RectAreaLight });

	const editor = provideEditorState();
	const initialPhonePosition: [number, number, number] = [0, -0.35, 0];
	const initialPhoneScale = 0.01;

	let wallpaperMat: MeshStandardMaterial | undefined = $state();
	let phoneScene: Group | undefined = $state();
	let orbitRef: ThreeOrbitControls | undefined = $state();
	let sceneCamera: PerspectiveCamera | undefined = $state();
	let exportCapture: ((settings: ExportSettings) => Promise<Blob>) | undefined = $state();
	let exportViewport: (() => ViewportSize) | undefined = $state();
	let hdriTexture: Texture | undefined = $state(undefined);
	let hdriLoading = $state(false);
	let previousHdriUrl = $state('');

	const activePreset = $derived(studioPresets[editor.studio]);

	const activeColorHex = $derived(
		editor.bodyColorId === 'custom' ? editor.customColor : bodyColors[editor.bodyColorId].hex,
	);

	function handleReset() {
		if (!phoneScene) return;
		phoneScene.position.set(...initialPhonePosition);
		phoneScene.rotation.set(0, 0.3, 0);
		phoneScene.scale.set(initialPhoneScale, initialPhoneScale, initialPhoneScale);
	}

	function handlePreset(pos: [number, number, number]) {
		if (!sceneCamera || !orbitRef) return;
		const wasDamping = orbitRef.enableDamping;
		orbitRef.enableDamping = false;
		sceneCamera.position.set(...pos);
		orbitRef.target.set(0, 0, 0);
		orbitRef.update();
		orbitRef.enableDamping = wasDamping;
	}

	function applyMaterialPreset() {
		if (!phoneScene) return;
		const preset = materialPresets[editor.material];
		phoneScene.traverse((child) => {
			// The logo keeps its own fixed finish — it never follows the body material.
			if (child instanceof Mesh && child.material && isBodyMesh(child.name) && !isLogoMesh(child.name)) {
				const mat = child.material as MeshStandardMaterial;
				const surface = preset?.surfaces[mat.name];
				if (surface) Object.assign(mat, surface);
			}
		});
	}

	/**
	 * The logo is always a polished chrome piece so it stays visible in every
	 * color / material / lighting, plus a slightly lighter tint and a faint
	 * emissive so it never disappears at flat angles.
	 */
	function applyLogoFinish() {
		if (!phoneScene) return;
		phoneScene.traverse((child) => {
			if (child instanceof Mesh && child.material && isLogoMesh(child.name)) {
				const mat = child.material as MeshStandardMaterial;
				Object.assign(mat, { metalness: 1, roughness: 0.02, envMapIntensity: 2.0 });
				mat.emissiveIntensity = 0.12;
			}
		});
	}

	function applyBodyColor() {
		if (!phoneScene) return;
		const bodyColor = new Color(activeColorHex);
		const logoColor = bodyColor.clone().lerp(new Color('#ffffff'), 0.3);
		phoneScene.traverse((child) => {
			if (child instanceof Mesh && child.material && isBodyMesh(child.name)) {
				const mat = child.material as MeshStandardMaterial;
				if (isLogoMesh(child.name)) {
					mat.color.copy(logoColor);
					mat.emissive.copy(logoColor);
				} else {
					mat.color.copy(bodyColor);
				}
			}
		});
	}

	function handleLoad(gltf: { scene: Group }) {
		phoneScene = gltf.scene;
		gltf.scene.traverse((child) => {
			if (child instanceof Mesh && child.material) {
				const mat = child.material as MeshStandardMaterial;
				const surface = surfaces[mat.name];
				if (surface) Object.assign(mat, surface);

				if (child.name === 'Screen_Wallpaper_0') {
					wallpaperMat = mat;
				}
			}
		});
		// Give front-facing parts (bezel, notch, cameras, mic) their own material
		// instances so body color / surface changes can never leak into them.
		gltf.scene.traverse((child) => {
			if (
				child instanceof Mesh &&
				child.material &&
				child.name !== 'Screen_Wallpaper_0' &&
				isFrontMesh(child.name)
			) {
				child.material = (child.material as MeshStandardMaterial).clone();
			}
		});
		applyMaterialPreset();
		applyLogoFinish();
		applyBodyColor();
	}

	function handleExporterReady(
		capture: (settings: ExportSettings) => Promise<Blob>,
		getViewport: () => ViewportSize,
	) {
		exportCapture = capture;
		exportViewport = getViewport;
	}

	$effect(() => {
		applyMaterialPreset();
	});

	$effect(() => {
		applyBodyColor();
	});

	$effect(() => {
		const url = editor.hdri;
		if (url !== previousHdriUrl) {
			previousHdriUrl = url;
			hdriLoading = true;
		}
	});

	$effect(() => {
		if (hdriTexture) {
			hdriLoading = false;
		}
	});
</script>

{#if browser}
	<div class="relative h-full w-full">
		<Canvas
			toneMapping={ACESFilmicToneMapping}
			createRenderer={(canvas) => new WebGLRenderer({ canvas, alpha: true, antialias: true })}
		>
			<Background config={editor.background} />
			<T.PerspectiveCamera
				makeDefault
				position={defaultCamera.position}
				fov={defaultCamera.fov}
			/>

			<LightRig preset={activePreset} exposure={editor.exposure} />

			<Environment url={editor.hdri} bind:texture={hdriTexture} />
			<GLTF
				url={MODEL_URL}
				position={initialPhonePosition}
				scale={initialPhoneScale}
				rotation={[0, 0.3, 0]}
				onload={handleLoad}
			/>

			{#if wallpaperMat}
				<ScreenImage material={wallpaperMat} src={editor.screenSrc} content={editor.content} />
			{/if}

			<ContactShadows
				position={[0, -0.8, 0]}
				opacity={editor.shadow.opacity}
				scale={6}
				blur={editor.shadow.blur}
				far={editor.shadow.distance}
				resolution={1024}
			/>

			<TransformControls
				target={phoneScene}
				mode={editor.transformMode}
				orbitControls={orbitRef}
			/>

			<CameraRef onref={(c) => (sceneCamera = c)} />

			<Exporter onready={handleExporterReady} />

			<OrbitControls
				enableDamping
				target={[0, 0, 0]}
				bind:ref={orbitRef}
			/>
		</Canvas>

		<EditorOverlay
			target={phoneScene}
			orbitControls={orbitRef}
			camera={sceneCamera}
			onreset={handleReset}
			onpreset={handlePreset}
			{exportCapture}
			exportViewport={exportViewport}
		/>

		{#if !phoneScene}
			<div class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center" role="status" aria-live="polite">
				<div class="flex items-center gap-2 rounded-md border border-gray-200 bg-[var(--kairo-base)] px-3 py-2 text-[12px] text-neutral-600 shadow-sm">
					<span class="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--kairo-sapphire)]"></span>
					Loading iPhone 12 Pro
				</div>
			</div>
		{/if}

		{#if hdriLoading && phoneScene}
			<div class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center" role="status" aria-live="polite">
				<div class="flex items-center gap-2 rounded-md border border-gray-200 bg-[var(--kairo-base)] px-3 py-2 text-[12px] text-neutral-600 shadow-sm">
					<span class="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--kairo-sapphire)]"></span>
					Loading environment...
				</div>
			</div>
		{/if}
	</div>
{/if}
