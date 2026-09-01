<script lang="ts">
	import { readFileAsDataUrl } from '$lib/editor/files';

	let {
		accept,
		label,
		onpick,
		onclear,
		clearLabel = 'Clear',
		name,
		showClear,
	}: {
		accept: string;
		label: string;
		onpick: (dataUrl: string) => void;
		onclear?: () => void;
		clearLabel?: string;
		name?: string;
		showClear?: boolean;
	} = $props();

	let input: HTMLInputElement | undefined = $state();

	function handleFile() {
		const file = input?.files?.[0];
		if (!file) return;
		readFileAsDataUrl(file, onpick);
		input!.value = '';
	}
</script>

<input bind:this={input} type="file" {accept} class="hidden" onchange={handleFile} />

<div class="flex gap-1.5">
	<button
		type="button"
		class="flex-1 rounded-md bg-[var(--kairo-sapphire)] px-2.5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-[var(--kairo-sapphire-strong)]"
		onclick={() => input?.click()}
	>
		{label}
	</button>
	{#if onclear && (showClear || name)}
		<button
			type="button"
			class="rounded-md border border-gray-200 px-2.5 py-2 text-[12px] font-medium text-neutral-600 transition-colors hover:bg-gray-100"
			onclick={onclear}
		>
			{clearLabel}
		</button>
	{/if}
</div>
{#if name}
	<p class="mt-1.5 truncate text-[11px] text-gray-400">{name}…</p>
{/if}
