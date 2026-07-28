<script lang="ts">
	import { browser } from '$app/environment';
	import { Canvas, T, extend } from '@threlte/core';
	import Background from './Background.svelte';
	import { OrbitControls, GLTF, Environment, ContactShadows } from '@threlte/extras';
	import {
		ACESFilmicToneMapping,
		Mesh,
		MeshStandardMaterial,
		RectAreaLight,
		type PerspectiveCamera,
		type Texture,
	} from 'three';
	// @ts-expect-error
	import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
	import type { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	import ScreenImage from './ScreenImage.svelte';
	import TransformControls from './TransformControls.svelte';
	import CameraRef from './CameraRef.svelte';
	import EditorOverlay from './EditorOverlay.svelte';

	RectAreaLightUniformsLib.init();

	extend({ RectAreaLight });

	let {
		screenSrc = '',
		onpick,
		onclear,
	}: {
		screenSrc?: string;
		onpick?: (dataUrl: string) => void;
		onclear?: () => void;
	} = $props();

	let envTexture: Texture | undefined = $state();
	let wallpaperMat: MeshStandardMaterial | undefined = $state();
	let phoneScene: import('three').Group | undefined = $state();
	let orbitRef: ThreeOrbitControls | undefined = $state();
	let sceneCamera: PerspectiveCamera | undefined = $state();
	let transformMode: 'translate' | 'rotate' | 'scale' = $state('translate');

	const materialPresets: Record<string, Partial<MeshStandardMaterial>> = {
		BodyFrame: { metalness: 1, roughness: 0.2, envMapIntensity: 1.0 },
		GrayGlossy2: { metalness: 1, roughness: 0.08, envMapIntensity: 1.0 },
		GrayGlossy: { metalness: 1, roughness: 0.35, envMapIntensity: 0.8 },
		PacificBlue: { metalness: 0.8, roughness: 0.3, envMapIntensity: 0.8 },
		Body: { metalness: 0.7, roughness: 0.45, envMapIntensity: 0.6 },
		Antenna: { metalness: 1, roughness: 0.7, envMapIntensity: 0.6 },
		Blackmatte: { metalness: 0, roughness: 0.85, envMapIntensity: 0.2 },
		Cameralens: { metalness: 0, roughness: 0.02, envMapIntensity: 0.6 },
		Glass: { metalness: 0, roughness: 0.05, envMapIntensity: 0.3 },
		bezel: { metalness: 0.6, roughness: 0.12, envMapIntensity: 0.5 },
		'bezel.001': { metalness: 0.4, roughness: 0.15, envMapIntensity: 0.4 },
		Logo: { metalness: 1, roughness: 0.15, envMapIntensity: 1.2 },
		FrontCamera: { metalness: 0, roughness: 0.85, envMapIntensity: 0.15 },
		MicrophoneSpeaker: { metalness: 0, roughness: 1, envMapIntensity: 0.15 },
		Flash: { metalness: 0.8, roughness: 0.3, envMapIntensity: 0.6 },
		Flash2: { metalness: 0.9, roughness: 0.6, envMapIntensity: 0.5 },
		LiDar: { metalness: 0, roughness: 0.9, envMapIntensity: 0.15 },
		Wallpaper: {
			metalness: 0,
			roughness: 0.6,
			envMapIntensity: 0.15,
			emissiveIntensity: 0.15,
		},
	};

	function handleReset() {
		if (!phoneScene) return;
		phoneScene.position.set(0, 0, 0);
		phoneScene.rotation.set(0, 0.3, 0);
		phoneScene.scale.set(0.01, 0.01, 0.01);
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

	function handleLoad(gltf: { scene: import('three').Group }) {
		phoneScene = gltf.scene;
		gltf.scene.traverse((child) => {
			if (child instanceof Mesh && child.material) {
				const material = child.material as MeshStandardMaterial;
				const preset = materialPresets[material.name];
				if (preset) Object.assign(material, preset);

				if (child.name === 'Screen_Wallpaper_0') {
					wallpaperMat = material;
				}
			}
		});
	}
</script>

{#if browser}
	<div class="relative h-full w-full">
		<Canvas toneMapping={ACESFilmicToneMapping}>
			<Background />
			<T.PerspectiveCamera
				makeDefault
				position={[4, 2.8, 5.5]}
				fov={24}
			/>

			<T.RectAreaLight
				position={[4, 3, 2]}
				rotation={[-0.4, 0.6, 0]}
				width={3}
				height={1.5}
				color="#ffeecc"
				intensity={4}
			/>

			<T.RectAreaLight
				position={[-3, 2, -1]}
				rotation={[0.2, -0.8, 0.1]}
				width={2}
				height={1}
				color="#ccddff"
				intensity={2}
			/>

			<Environment
				url="/environments/studio_small_08_1k.exr"
				bind:texture={envTexture}
			/>
			<GLTF
				url="/models/iphone_12_pro.glb"
				scale={0.01}
				rotation={[0, 0.3, 0]}
				onload={handleLoad}
			/>

			{#if wallpaperMat}
				<ScreenImage material={wallpaperMat} src={screenSrc} />
			{/if}

			<ContactShadows
				position={[0, -0.8, 0]}
				opacity={0.25}
				scale={6}
				blur={4}
				far={3}
				resolution={1024}
			/>

			<TransformControls
				target={phoneScene}
				mode={transformMode}
				{orbitRef}
			/>

			<CameraRef onref={(c) => (sceneCamera = c)} />

			<OrbitControls
				enableDamping
				target={[0, 0, 0]}
				bind:ref={orbitRef}
			/>
		</Canvas>

		<EditorOverlay
			mode={transformMode}
			onmodechange={(m) => (transformMode = m)}
			target={phoneScene}
			{orbitRef}
			onpick={(url) => onpick?.(url)}
			onclear={() => onclear?.()}
			onreset={handleReset}
			onpreset={handlePreset}
			hasImage={screenSrc !== ''}
		/>
	</div>
{/if}
