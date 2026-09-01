<script lang="ts">
	import { getEditorState, type SceneObjectId } from '$lib/editor/state.svelte';

	const editor = getEditorState();

	const sceneObjects = $derived<{ id: SceneObjectId; label: string }[]>([
		{ id: 'phone', label: editor.modelName },
		{ id: 'background', label: 'Background' },
		{ id: 'lights', label: 'Lights' },
		{ id: 'camera', label: 'Camera' },
	]);

</script>

<div
	class="pointer-events-auto flex h-full w-56 shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-[var(--kairo-mantle)]"
>
	<div class="flex-1 overflow-y-auto">
		<div class="p-2">
			{#each sceneObjects as obj}
				<button
					class="mb-1 flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors {editor.selection === obj.id
						? 'bg-[var(--kairo-sapphire-soft)] text-[var(--kairo-sapphire-strong)]'
						: 'text-neutral-600 hover:bg-gray-100 hover:text-neutral-900'}"
					onclick={() => editor.select(editor.selection === obj.id ? null : obj.id)}
				>
					{@render icon(obj.id)}
					<span class="truncate font-medium">{obj.label}</span>
				</button>
			{/each}
		</div>
	</div>
</div>

{#snippet icon(id: string)}
	{#if id === 'phone'}
		<svg width="12" height="12" viewBox="0 0 15 15" fill="none">
			<rect x="4" y="1" width="7" height="13" rx="1.4" stroke="currentColor" stroke-width="1.2" />
			<path d="M6 12h3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" />
		</svg>
	{:else if id === 'background'}
		<svg width="12" height="12" viewBox="0 0 15 15" fill="none">
			<rect x="1.5" y="2.5" width="12" height="10" rx="1.3" stroke="currentColor" stroke-width="1.2" />
			<path d="M4 9l2.5-2.5L9 9.5M9.5 8l1.5-1.5 1 1" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	{:else if id === 'lights'}
		<svg width="12" height="12" viewBox="0 0 15 15" fill="none">
			<circle cx="7.5" cy="7.5" r="2.6" stroke="currentColor" stroke-width="1.2" />
			<path d="M7.5 2v1.6M7.5 11.4V13M13 7.5h-1.6M3.6 7.5H2M11.2 3.8l-1.1 1.1M4.9 10.1l-1.1 1.1M11.2 11.2l-1.1-1.1M4.9 4.9L3.8 3.8" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" />
		</svg>
	{:else if id === 'camera'}
		<svg width="12" height="12" viewBox="0 0 15 15" fill="none">
			<rect x="1.5" y="4" width="12" height="8" rx="1.3" stroke="currentColor" stroke-width="1.2" />
			<path d="M5 4l1-1.5h3l1 1.5" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round" />
			<circle cx="7.5" cy="8" r="2" stroke="currentColor" stroke-width="1.1" />
		</svg>
	{/if}
{/snippet}
