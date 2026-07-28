<script lang="ts">
	import { onMount } from 'svelte';

	let {
		mode,
		onmodechange,
	}: {
		mode: 'translate' | 'rotate' | 'scale';
		onmodechange: (mode: 'translate' | 'rotate' | 'scale') => void;
	} = $props();

	const modes = [
		{ id: 'translate', key: 'G', label: 'Move' },
		{ id: 'rotate', key: 'R', label: 'Rotate' },
		{ id: 'scale', key: 'S', label: 'Scale' },
	] as const;

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'g' || e.key === 'G') onmodechange('translate');
		else if (e.key === 'r' || e.key === 'R') onmodechange('rotate');
		else if (e.key === 's' || e.key === 'S') onmodechange('scale');
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="pointer-events-auto flex justify-center p-2">
	<div
		class="inline-flex rounded-lg bg-white/90 shadow-lg backdrop-blur-sm border border-gray-200 overflow-hidden"
	>
		{#each modes as m}
			<button
				class="px-4 py-2 text-sm font-medium transition-colors {mode === m.id ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'}"
				onclick={() => onmodechange(m.id)}
			>
				{m.label}
				<span class="ml-1 text-[10px] opacity-50">{m.key}</span>
			</button>
		{/each}
	</div>
</div>
