<script lang="ts">
	import { ImagePlus, Trash2 } from '@lucide/svelte';
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

<div class="media-actions">
	<button
		data-showcase="media-picker"
		type="button"
		class="media-button primary"
		onclick={() => input?.click()}
	>
		<ImagePlus size={14} strokeWidth={1.7} />
		{label}
	</button>
	{#if onclear && (showClear || name)}
		<button
			type="button"
			class="media-button"
			onclick={onclear}
		>
			<Trash2 size={13} strokeWidth={1.7} />
			{clearLabel}
		</button>
	{/if}
</div>
{#if name}
	<p class="media-name">{name}...</p>
{/if}

<style>
	.media-actions {
		display: flex;
		min-width: 0;
		gap: 6px;
	}

	.media-button {
		display: flex;
		height: 30px;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 0 9px;
		border: 1px solid var(--kairo-divider);
		border-radius: var(--radius-control);
		background: transparent;
		color: var(--kairo-ink-secondary);
		font-size: 11px;
		font-weight: 600;
		transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease;
	}

	.media-button:hover {
		border-color: var(--kairo-ink-faint);
		background: var(--kairo-field);
		color: var(--kairo-ink);
	}

	.media-button.primary {
		flex: 1 1 auto;
		border-color: color-mix(in oklch, var(--kairo-sapphire) 42%, var(--kairo-divider));
		color: var(--kairo-sapphire-strong);
	}

	.media-name {
		overflow: hidden;
		margin: 6px 0 0;
		color: var(--kairo-ink-muted);
		font-size: 10px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
