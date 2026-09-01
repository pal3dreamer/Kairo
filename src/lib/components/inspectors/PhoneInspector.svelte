<script lang="ts">
	import Section from '../fields/Section.svelte';
	import Slider from '../fields/Slider.svelte';
	import Segmented from '../fields/Segmented.svelte';
	import SwatchRow from '../fields/SwatchRow.svelte';
	import ColorField from '../fields/ColorField.svelte';
	import NumberRow from '../fields/NumberRow.svelte';
	import MediaPicker from '../fields/MediaPicker.svelte';
	import { poll } from '$lib/editor/poll';
	import { getEditorState, type ContentConfig, type ShadowConfig } from '$lib/editor/state.svelte';
	import { bodyColorList } from '$lib/renderer/bodyColors';
	import { finishOptions } from '$lib/renderer/presets';
	import type { BodyColorId, MaterialPresetId } from '$lib/renderer/types';

	let {
		target,
		onreset,
	}: {
		target: import('three').Object3D | undefined;
		onreset?: () => void;
	} = $props();

	const editor = getEditorState();

	let pos = $state<[number, number, number]>([0, 0, 0]);
	let rot = $state<[number, number, number]>([0, 0, 0]);
	let sca = $state<[number, number, number]>([1, 1, 1]);

	const colors = bodyColorList.map((c) => ({
		id: c.id,
		label: c.label,
		swatch: c.id === 'custom' ? editor.customColor : c.hex,
	}));

	poll(
		() => {
			if (!target) return null;
			return {
				position: [target.position.x, target.position.y, target.position.z] as [number, number, number],
				rotation: [
					+(target.rotation.x * (180 / Math.PI)).toFixed(1),
					+(target.rotation.y * (180 / Math.PI)).toFixed(1),
					+(target.rotation.z * (180 / Math.PI)).toFixed(1),
				] as [number, number, number],
				scale: [target.scale.x, target.scale.y, target.scale.z] as [number, number, number],
			};
		},
		(v) => {
			pos = v.position;
			rot = v.rotation;
			sca = v.scale;
		},
	);

	function setPos(x: number, y: number, z: number) {
		target?.position.set(x, y, z);
	}
	function setRot(x: number, y: number, z: number) {
		target?.rotation.set((x * Math.PI) / 180, (y * Math.PI) / 180, (z * Math.PI) / 180);
	}
	function setSca(x: number, y: number, z: number) {
		target?.scale.set(x, y, z);
	}

	function patchContent(part: Partial<ContentConfig>) {
		editor.setContent({ ...editor.content, ...part });
	}

	function patchShadow(part: Partial<ShadowConfig>) {
		editor.setShadow({ ...editor.shadow, ...part });
	}
</script>

<Section title="Transform" open={true}>
	<div class="space-y-2.5">
		<NumberRow label="Position" x={pos[0]} y={pos[1]} z={pos[2]} onchange={setPos} />
		<NumberRow label="Rotation" x={rot[0]} y={rot[1]} z={rot[2]} step={1} onchange={setRot} />
		<NumberRow label="Scale" x={sca[0]} y={sca[1]} z={sca[2]} step={0.01} onchange={setSca} />
		{#if onreset}
			<button
				class="w-full rounded-md border border-gray-200 px-2.5 py-2 text-[12px] text-neutral-600 transition-colors hover:bg-gray-100"
				onclick={onreset}
			>
				Reset Transform
			</button>
		{/if}
	</div>
</Section>

<Section title="Appearance">
	<div class="space-y-3.5">
		<div>
			<span class="mb-2 block text-[12px] text-gray-500">Color</span>
			<SwatchRow options={colors} value={editor.bodyColorId} onchange={(id) => editor.setBodyColor(id as BodyColorId)} />
			{#if editor.bodyColorId === 'custom'}
				<div class="mt-2.5">
					<ColorField label="Custom" value={editor.customColor} oninput={(hex) => editor.setCustomColor(hex)} />
				</div>
			{/if}
		</div>
		<div>
			<span class="mb-2 block text-[12px] text-gray-500">Finish</span>
			<Segmented options={finishOptions} value={editor.material} onchange={(id) => editor.setMaterial(id as MaterialPresetId)} columns={3} />
		</div>
	</div>
</Section>

<Section title="Screen">
	<div class="space-y-3">
		<MediaPicker
			accept="image/*"
			label="Replace"
			onpick={(dataUrl) => editor.setScreen(dataUrl)}
			onclear={editor.clearScreen}
			clearLabel="Remove"
			showClear={!!editor.screenSrc}
		/>

		<div>
			<span class="mb-2 block text-[12px] text-gray-500">Fit</span>
			<Segmented
				options={[
					{ id: 'fit', label: 'Fit' },
					{ id: 'fill', label: 'Fill' },
					{ id: 'stretch', label: 'Stretch' },
				]}
				value={editor.content.fit}
				onchange={(id) => patchContent({ fit: id as ContentConfig['fit'] })}
			/>
		</div>

		<Slider label="Scale" min={0.2} max={2} step={0.01} value={editor.content.scale} onchange={(v) => patchContent({ scale: v })} />
		<Slider label="Rotate" min={-180} max={180} step={1} value={editor.content.rotation} format={(v) => `${Math.round(v)}°`} onchange={(v) => patchContent({ rotation: v })} />
		<Slider label="Pos X" min={-1} max={1} step={0.01} value={editor.content.offsetX} onchange={(v) => patchContent({ offsetX: v })} />
		<Slider label="Pos Y" min={-1} max={1} step={0.01} value={editor.content.offsetY} onchange={(v) => patchContent({ offsetY: v })} />
		<Slider label="Brightness" min={0} max={2} step={0.01} value={editor.content.brightness} format={(v) => `${v.toFixed(2)}×`} onchange={(v) => patchContent({ brightness: v })} />
		<Slider label="Contrast" min={0} max={2} step={0.01} value={editor.content.contrast} format={(v) => `${v.toFixed(2)}×`} onchange={(v) => patchContent({ contrast: v })} />
		<Slider label="Saturation" min={0} max={2} step={0.01} value={editor.content.saturation} format={(v) => `${v.toFixed(2)}×`} onchange={(v) => patchContent({ saturation: v })} />
	</div>
</Section>

<Section title="Shadow">
	<div class="space-y-2.5">
		<Slider label="Opacity" min={0} max={1} step={0.01} value={editor.shadow.opacity} onchange={(v) => patchShadow({ opacity: v })} />
		<Slider label="Blur" min={0} max={10} step={0.1} value={editor.shadow.blur} onchange={(v) => patchShadow({ blur: v })} />
		<Slider label="Distance" min={0} max={6} step={0.1} value={editor.shadow.distance} onchange={(v) => patchShadow({ distance: v })} />
	</div>
</Section>
