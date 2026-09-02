<script lang="ts">
	import Section from '../fields/Section.svelte';
	import Slider from '../fields/Slider.svelte';
	import { getEditorState } from '$lib/editor/state.svelte';

	const editor = getEditorState();
</script>

<Section title="Exposure" open={true} summary={`${editor.exposure.toFixed(2)}x`}>
	<Slider
		label="Exposure"
		min={0.1}
		max={2}
		step={0.05}
		value={editor.exposure}
		format={(value) => `${value.toFixed(2)}x`}
		onchange={(value) => editor.setExposure(value)}
	/>
</Section>
