<script lang="ts">
	let {
		title,
		open = true,
		children,
	}: {
		title: string;
		open?: boolean;
		children: import('svelte').Snippet;
	} = $props();

	const initialOpen = () => open;
	let isOpen = $state(initialOpen());
</script>

<section class="border-b border-gray-100 last:border-b-0">
	<button
		class="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left"
		onclick={() => (isOpen = !isOpen)}
		aria-expanded={isOpen}
	>
		<span class="text-[12px] font-semibold uppercase tracking-wider text-gray-400">{title}</span>
		<span class="text-[10px] text-gray-300">{isOpen ? '▾' : '▸'}</span>
	</button>
	{#if isOpen}
		<div class="min-w-0 px-3.5 pb-3.5">
			{@render children()}
		</div>
	{/if}
</section>
