<script lang="ts">
	import Section from '../fields/Section.svelte';
	import Segmented from '../fields/Segmented.svelte';
	import ColorField from '../fields/ColorField.svelte';
	import MediaPicker from '../fields/MediaPicker.svelte';
	import Slider from '../fields/Slider.svelte';
	import { getEditorState } from '$lib/editor/state.svelte';
	import type { BackgroundConfig, BackgroundType } from '$lib/renderer/types';

	const editor = getEditorState();

	const types: { id: BackgroundType; label: string }[] = [
		{ id: 'solid', label: 'Solid' },
		{ id: 'gradient', label: 'Gradient' },
		{ id: 'image', label: 'Image' },
		{ id: 'transparent', label: 'None' },
	];

	function patch(part: Partial<BackgroundConfig>) {
		editor.setBackground({ ...editor.background, ...part });
	}

	function mediaName(url: string | undefined) {
		if (!url) return '';
		const parts = url.split('/');
		return decodeURIComponent(parts[parts.length - 1].slice(0, 18));
	}
</script>

<Section title="Type" summary={editor.background.type} showcaseId="background-type" open={true}>
	<Segmented options={types} value={editor.background.type} onchange={(type) => patch({ type: type as BackgroundType })} columns={4} />
</Section>

{#if editor.background.type === 'solid'}
	<Section title="Color" open={true} summary={editor.background.solidColor}>
		<ColorField label="Color" value={editor.background.solidColor ?? '#f7f7f7'} oninput={(color) => patch({ solidColor: color })} />
	</Section>
{:else if editor.background.type === 'gradient'}
	<Section title="Gradient" open={true} summary={`${Math.round(editor.background.gradientAngle ?? 180)}°`}>
		<div class="color-stack">
			<ColorField label="Top" value={editor.background.gradientTop ?? '#ececec'} oninput={(color) => patch({ gradientTop: color })} />
			<ColorField label="Bottom" value={editor.background.gradientBottom ?? '#f8f8f8'} oninput={(color) => patch({ gradientBottom: color })} />
			<div class="gradient-controls">
				<Slider label="Angle" min={0} max={360} step={1} value={editor.background.gradientAngle ?? 180} format={(value) => `${Math.round(value)}°`} onchange={(value) => patch({ gradientAngle: value })} />
				<Slider label="Transition" min={0.08} max={1} step={0.01} value={editor.background.gradientSpread ?? 1} format={(value) => `${Math.round(value * 100)}%`} onchange={(value) => patch({ gradientSpread: value })} />
			</div>
		</div>
	</Section>
{:else if editor.background.type === 'image'}
	<Section title="Image" open={true} summary={editor.background.imageUrl ? 'Loaded' : 'Empty'}>
		<MediaPicker
			accept="image/*"
			label={editor.background.imageUrl ? 'Replace image' : 'Add image'}
			name={mediaName(editor.background.imageUrl)}
			onpick={(dataUrl) => patch({ imageUrl: dataUrl })}
			onclear={() => patch({ imageUrl: undefined })}
		/>
	</Section>
{/if}

<style>
	.color-stack {
		display: grid;
		gap: 9px;
	}

	.gradient-controls {
		display: grid;
		gap: 2px;
		padding-top: 2px;
	}
</style>
