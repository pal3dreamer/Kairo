<script lang="ts">
	let {
		options,
		value,
		onchange,
		columns,
	}: {
		options: { id: string; label: string; swatch?: string }[];
		value: string;
		onchange: (id: string) => void;
		columns?: number;
	} = $props();
</script>

<div
	class="grid gap-1.5"
	style={`grid-template-columns: repeat(${columns ?? options.length}, minmax(0, 1fr))`}
>
	{#each options as opt (opt.id)}
		<button
			class="flex items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-[12px] font-medium transition-colors {value === opt.id
				? 'border-[var(--kairo-sapphire)] bg-[var(--kairo-sapphire)] text-white'
				: 'bg-white text-neutral-600 border-gray-200 hover:bg-neutral-100 hover:text-neutral-900'}"
			onclick={() => onchange(opt.id)}
		>
			{#if opt.swatch}
				<span
					class="h-3 w-3 shrink-0 rounded-full ring-1 ring-black/10"
					style={`background: ${opt.swatch}`}
				></span>
			{/if}
			<span class="truncate">{opt.label}</span>
		</button>
	{/each}
</div>
