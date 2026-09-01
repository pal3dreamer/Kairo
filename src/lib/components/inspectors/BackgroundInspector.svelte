<script lang="ts">
	import Section from '../fields/Section.svelte';
	import Segmented from '../fields/Segmented.svelte';
	import ColorField from '../fields/ColorField.svelte';
	import MediaPicker from '../fields/MediaPicker.svelte';
	import { getEditorState } from '$lib/editor/state.svelte';
	import { backgroundPresets } from '$lib/renderer/presets';
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

<Section title="Presets" open={true}>
	<div class="grid grid-cols-3 gap-2">
		{#each backgroundPresets as p}
			<button
				title={p.label}
				class="flex h-11 items-center justify-center rounded-md border transition-transform hover:scale-105 {editor.background.type === p.config.type
					? 'border-[var(--kairo-sapphire)] ring-2 ring-[var(--kairo-sapphire-soft)]'
					: 'border-gray-200'}"
				style={`background: ${p.swatch}`}
				onclick={() => editor.setBackground(p.config)}
			></button>
		{/each}
	</div>
</Section>

<Section title="Type" open={true}>
	<Segmented options={types} value={editor.background.type} onchange={(type) => patch({ type: type as BackgroundType })} columns={4} />
</Section>

{#if editor.background.type === 'solid'}
	<Section title="Color">
		<ColorField
			label="Color"
			value={editor.background.solidColor ?? '#ffffff'}
			oninput={(c) => patch({ solidColor: c })}
		/>
	</Section>
{:else if editor.background.type === 'gradient'}
	<Section title="Gradient">
		<div class="space-y-2">
			<ColorField
				label="Top"
				value={editor.background.gradientTop ?? '#ececec'}
				oninput={(c) => patch({ gradientTop: c })}
			/>
			<ColorField
				label="Bottom"
				value={editor.background.gradientBottom ?? '#f8f8f8'}
				oninput={(c) => patch({ gradientBottom: c })}
			/>
		</div>
	</Section>
{:else if editor.background.type === 'image'}
	<Section title="Image">
		<MediaPicker
			accept="image/*"
			label="Upload"
			name={mediaName(editor.background.imageUrl)}
			onpick={(dataUrl) => patch({ imageUrl: dataUrl })}
			onclear={() => patch({ imageUrl: undefined })}
		/>
	</Section>
{/if}
