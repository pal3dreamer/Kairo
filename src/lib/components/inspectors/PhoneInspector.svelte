<script lang="ts">
	import { RotateCcw } from '@lucide/svelte';
	import Section from '../fields/Section.svelte';
	import Slider from '../fields/Slider.svelte';
	import Segmented from '../fields/Segmented.svelte';
	import SwatchRow from '../fields/SwatchRow.svelte';
	import ColorField from '../fields/ColorField.svelte';
	import NumberRow from '../fields/NumberRow.svelte';
	import { poll } from '$lib/editor/poll';
	import { getEditorState, type ContentConfig, type ShadowConfig } from '$lib/editor/state.svelte';
	import { bodyColorList } from '$lib/renderer/bodyColors';
	import type { BodyColorId } from '$lib/renderer/types';

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

	const colors = $derived(
		bodyColorList.map((color) => ({
			id: color.id,
			label: color.label,
			swatch: color.id === 'custom' ? editor.customColor : color.hex,
		})),
	);

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
		(value) => {
			pos = value.position;
			rot = value.rotation;
			sca = value.scale;
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

<Section title="Appearance" open={true} summary={bodyColorList.find((color) => color.id === editor.bodyColorId)?.label} showcaseId="appearance">
	<div class="field-stack roomy">
		<div class="field-group">
			<span class="field-label">Body color</span>
			<SwatchRow options={colors} value={editor.bodyColorId} onchange={(id) => editor.setBodyColor(id as BodyColorId)} />
		</div>
		{#if editor.bodyColorId === 'custom'}
			<ColorField label="Custom" value={editor.customColor} oninput={(hex) => editor.setCustomColor(hex)} />
		{/if}
	</div>
</Section>

<Section title="Screen" summary={editor.screenSrc ? 'Image' : 'Empty'} showcaseId="screen" open={false}>
	<div class="field-stack">
		<div class="field-group compact">
			<span class="field-label">Fit</span>
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

		<div class="control-list">
			<Slider label="Scale" min={0.2} max={2} step={0.01} value={editor.content.scale} onchange={(value) => patchContent({ scale: value })} />
			<Slider label="Rotate" min={-180} max={180} step={1} value={editor.content.rotation} format={(value) => `${Math.round(value)}°`} onchange={(value) => patchContent({ rotation: value })} />
			<Slider label="Pos X" min={-1} max={1} step={0.01} value={editor.content.offsetX} format={(value) => value.toFixed(2)} onchange={(value) => patchContent({ offsetX: value })} />
			<Slider label="Pos Y" min={-1} max={1} step={0.01} value={editor.content.offsetY} format={(value) => value.toFixed(2)} onchange={(value) => patchContent({ offsetY: value })} />
			<Slider label="Brightness" min={0} max={2} step={0.01} value={editor.content.brightness} format={(value) => `${value.toFixed(2)}x`} onchange={(value) => patchContent({ brightness: value })} />
			<Slider label="Contrast" min={0} max={2} step={0.01} value={editor.content.contrast} format={(value) => `${value.toFixed(2)}x`} onchange={(value) => patchContent({ contrast: value })} />
			<Slider label="Saturation" min={0} max={2} step={0.01} value={editor.content.saturation} format={(value) => `${value.toFixed(2)}x`} onchange={(value) => patchContent({ saturation: value })} />
		</div>
	</div>
</Section>

<Section title="Transform" summary={`${rot[1].toFixed(0)}°`} open={false}>
	<div class="field-stack compact-stack">
		<NumberRow label="Position" x={pos[0]} y={pos[1]} z={pos[2]} onchange={setPos} />
		<NumberRow label="Rotation" x={rot[0]} y={rot[1]} z={rot[2]} step={1} onchange={setRot} />
		<NumberRow label="Scale" x={sca[0]} y={sca[1]} z={sca[2]} step={0.01} onchange={setSca} />
		{#if onreset}
			<button type="button" class="reset-button" onclick={onreset}>
				<RotateCcw size={13} strokeWidth={1.7} />
				Reset transform
			</button>
		{/if}
	</div>
</Section>

<Section title="Shadow" summary={`${Math.round(editor.shadow.opacity * 100)}%`} showcaseId="shadow" open={false}>
	<div class="control-list">
		<Slider label="Opacity" min={0} max={1} step={0.01} value={editor.shadow.opacity} format={(value) => `${Math.round(value * 100)}%`} onchange={(value) => patchShadow({ opacity: value })} />
		<Slider label="Blur" min={0} max={10} step={0.1} value={editor.shadow.blur} format={(value) => value.toFixed(1)} onchange={(value) => patchShadow({ blur: value })} />
		<Slider label="Distance" min={0} max={6} step={0.1} value={editor.shadow.distance} format={(value) => value.toFixed(1)} onchange={(value) => patchShadow({ distance: value })} />
	</div>
</Section>

<style>
	.field-stack {
		display: grid;
		gap: 12px;
	}

	.field-stack.roomy {
		gap: 14px;
	}

	.compact-stack {
		gap: 8px;
	}

	.field-group {
		display: grid;
		gap: 8px;
	}

	.field-group.compact {
		gap: 6px;
	}

	.field-label {
		color: var(--kairo-ink-secondary);
		font-size: 11px;
	}

	.control-list {
		display: grid;
		gap: 2px;
	}

	.reset-button {
		display: flex;
		height: 29px;
		align-items: center;
		justify-content: center;
		gap: 6px;
		margin-top: 2px;
		border: 1px solid var(--kairo-divider);
		border-radius: 4px;
		background: transparent;
		color: var(--kairo-ink-secondary);
		font-size: 11px;
		font-weight: 600;
	}

	.reset-button:hover {
		background: var(--kairo-field);
		color: var(--kairo-ink);
	}
</style>
