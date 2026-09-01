<script lang="ts">
	let {
		label,
		meta,
		active = false,
		preview,
		image,
		onclick,
		children,
		showcaseOption,
	}: {
		label: string;
		meta?: string;
		active?: boolean;
		preview?: string;
		image?: string;
		onclick: () => void;
		children?: import('svelte').Snippet;
		showcaseOption?: string;
	} = $props();
</script>

<button
	type="button"
	data-showcase-option={showcaseOption}
	class:active
	class="preset-tile"
	aria-pressed={active}
	title={label}
	{onclick}
>
	<span
		class="preset-preview"
		style:background={preview}
		style:background-image={image ? `url(${image})` : undefined}
	>
		{#if children}
			{@render children()}
		{/if}
		{#if active}
			<span class="active-mark" aria-hidden="true"></span>
		{/if}
	</span>
	<span class="preset-copy">
		<span class="preset-label">{label}</span>
		{#if meta}<span class="preset-meta">{meta}</span>{/if}
	</span>
</button>

<style>
	.preset-tile {
		display: grid;
		min-width: 0;
		gap: 6px;
		padding: 3px;
		border: 1px solid transparent;
		border-radius: 6px;
		background: transparent;
		color: var(--kairo-ink-secondary);
		text-align: left;
		transition: border-color 140ms ease, background-color 140ms ease, transform 80ms ease;
	}

	.preset-tile:hover {
		background: transparent;
		color: var(--kairo-ink);
	}

	.preset-tile:active {
		transform: translateY(1px);
	}

	.preset-tile.active {
		border-color: color-mix(in oklch, var(--kairo-sapphire) 68%, var(--kairo-divider));
		background: var(--kairo-sapphire-faint);
	}

	.preset-preview {
		position: relative;
		display: grid;
		width: 100%;
		aspect-ratio: 1.55;
		overflow: hidden;
		place-items: center;
		border: 1px solid var(--kairo-divider-soft);
		border-radius: 4px;
		background-color: var(--kairo-field);
		background-position: center;
		background-size: cover;
	}

	.active-mark {
		position: absolute;
		right: 6px;
		top: 6px;
		height: 6px;
		width: 6px;
		border-radius: 50%;
		background: var(--kairo-sapphire);
		box-shadow: 0 0 0 2px color-mix(in oklch, var(--kairo-panel-raised) 82%, transparent);
	}

	.preset-copy {
		display: flex;
		min-width: 0;
		align-items: baseline;
		justify-content: space-between;
		gap: 4px;
		padding: 0 2px 2px;
	}

	.preset-label {
		overflow: hidden;
		font-size: 11px;
		font-weight: 600;
		line-height: 1.2;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.preset-meta {
		flex: 0 0 auto;
		color: var(--kairo-ink-faint);
		font-size: 9px;
		font-variant-numeric: tabular-nums;
	}
</style>
