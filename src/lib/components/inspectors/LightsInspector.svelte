<script lang="ts">
	import Section from '../fields/Section.svelte';
	import Slider from '../fields/Slider.svelte';
	import Segmented from '../fields/Segmented.svelte';
	import { getEditorState } from '$lib/editor/state.svelte';
	import { studioPresetList } from '$lib/renderer/studioPresets';
	import { hdriOptions } from '$lib/renderer/presets';
	import { defaultHdri } from '$lib/renderer/defaults';
	import type { StudioPresetId } from '$lib/renderer/types';

	const editor = getEditorState();

	const presets = studioPresetList.map((p) => ({ id: p.id, label: p.label, swatch: p.swatch }));
</script>

<Section title="Preset" open={true}>
	<Segmented options={presets} value={editor.studio} onchange={(id) => editor.setStudio(id as StudioPresetId)} columns={2} />
</Section>

<Section title="Exposure">
	<Slider label="Exposure" min={0.1} max={2} step={0.05} value={editor.exposure} format={(v) => `${v.toFixed(2)}×`} onchange={(v) => editor.setExposure(v)} />
</Section>

<Section title="Environment" open={true}>
	<div class="space-y-1.5">
		{#each hdriOptions as h}
			<button
				class="w-full rounded-md border px-2.5 py-2 text-left text-[12px] transition-colors {editor.hdri === h.url || (editor.hdri === defaultHdri && h.id === 'studio-1k')
					? 'border-[var(--kairo-sapphire)] bg-[var(--kairo-sapphire)] text-white'
					: 'border-gray-200 text-neutral-600 hover:bg-gray-100'}"
				onclick={() => editor.setHdri(h.url)}
			>
				{h.label}
			</button>
		{/each}
	</div>
</Section>
