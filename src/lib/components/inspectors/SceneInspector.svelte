<script lang="ts">
	import { getEditorState } from '$lib/editor/state.svelte';
	import { studioPresets } from '$lib/renderer/studioPresets';
	import Section from '../fields/Section.svelte';

	const editor = getEditorState();
</script>

<Section title="Scene summary" open={true} summary="4 objects">
	<dl class="scene-summary">
		<div><dt>Device</dt><dd>{editor.modelName}</dd></div>
		<div><dt>Background</dt><dd>{editor.background.type}</dd></div>
		<div><dt>Lighting</dt><dd>{studioPresets[editor.studio].label}</dd></div>
		<div><dt>Camera</dt><dd>Perspective</dd></div>
	</dl>
</Section>

<style>
	.scene-summary {
		display: grid;
		gap: 0;
		margin: 0;
	}

	.scene-summary div {
		display: grid;
		min-width: 0;
		grid-template-columns: 72px minmax(0, 1fr);
		align-items: baseline;
		gap: 8px;
		padding: 7px 4px;
		border-bottom: 1px solid var(--kairo-divider-soft);
	}

	.scene-summary div:last-child {
		border-bottom: 0;
	}

	.scene-summary dt,
	.scene-summary dd {
		margin: 0;
		font-size: 11px;
	}

	.scene-summary dt {
		color: var(--kairo-ink-secondary);
	}

	.scene-summary dd {
		overflow: hidden;
		color: var(--kairo-ink-muted);
		text-align: right;
		text-overflow: ellipsis;
		text-transform: capitalize;
		white-space: nowrap;
	}
</style>
