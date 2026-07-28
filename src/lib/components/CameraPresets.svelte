<script lang="ts">
	let {
		onpreset,
	}: {
		onpreset?: (pos: [number, number, number]) => void;
	} = $props();

	const presets: { label: string; pos: [number, number, number] }[] = [
		{ label: 'Front', pos: [0, 0, 8] },
		{ label: '¾ Front', pos: [4, 2.8, 5.5] },
		{ label: 'Side', pos: [8, 0, 0] },
		{ label: 'Top', pos: [0, 8, 0.1] },
		{ label: 'Perspective', pos: [6, 4, 6] },
		{ label: 'Isometric', pos: [5, 5, 5] },
	];
</script>

<div
	class="pointer-events-auto bg-white/90 rounded-lg shadow-lg backdrop-blur-sm border border-gray-200 p-3 w-56"
>
	<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
		Camera
	</h3>
	<div class="grid grid-cols-2 gap-1">
		{#each presets as p}
			<button
				class="px-2 py-1 text-xs rounded bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
				onclick={() => onpreset?.(p.pos)}
			>
				{p.label}
			</button>
		{/each}
	</div>
</div>
