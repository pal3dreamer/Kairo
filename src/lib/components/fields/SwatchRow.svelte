<script lang="ts">
	let {
		options,
		value,
		onchange,
	}: {
		options: { id: string; label: string; swatch: string }[];
		value: string;
		onchange: (id: string) => void;
	} = $props();
</script>

<div class="flex flex-wrap gap-2">
	{#each options as opt (opt.id)}
		<button
			title={opt.label}
			class="h-8 w-8 rounded-full border transition-transform {value === opt.id
				? 'border-[var(--kairo-sapphire)] ring-2 ring-[var(--kairo-sapphire-soft)] scale-110'
				: 'border-black/10 hover:scale-105'}"
			style={`background: ${opt.swatch}`}
			onclick={() => onchange(opt.id)}
		></button>
	{/each}
</div>
