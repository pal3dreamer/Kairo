<script lang="ts">
	let {
		target,
	}: {
		target: import('three').Object3D | undefined;
	} = $props();

	let names = $state<string[]>([]);

	$effect(() => {
		if (!target) return;
		const list: string[] = [];
		target.traverse((child) => {
			if (child.name) list.push(child.name);
		});
		names = list;
	});
</script>

<div
	class="pointer-events-auto bg-white/90 rounded-lg shadow-lg backdrop-blur-sm border border-gray-200 p-3 w-56 max-h-60 overflow-y-auto"
>
	<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
		Scene
	</h3>
	{#if names.length === 0}
		<p class="text-xs text-gray-400">No scene loaded</p>
	{:else}
		<div class="space-y-0.5">
			{#each names as name}
				<div class="text-xs text-gray-600 truncate">{name}</div>
			{/each}
		</div>
	{/if}
</div>
