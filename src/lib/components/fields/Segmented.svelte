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
	class="segmented"
	style={`grid-template-columns: repeat(${columns ?? options.length}, minmax(0, 1fr))`}
>
	{#each options as opt (opt.id)}
		<button
			data-showcase-option={opt.id}
			type="button"
			class:active={value === opt.id}
			class="segment"
			aria-pressed={value === opt.id}
			onclick={() => onchange(opt.id)}
		>
			{#if opt.swatch}
				<span
					class="swatch"
					style={`background: ${opt.swatch}`}
				></span>
			{/if}
			<span class="segment-label">{opt.label}</span>
		</button>
	{/each}
</div>

<style>
	.segmented {
		display: grid;
		min-width: 0;
		gap: 2px;
		padding: 2px;
		border: 1px solid var(--kairo-divider-soft);
		border-radius: var(--radius-control);
		background: var(--kairo-field);
	}

	.segment {
		display: flex;
		height: 27px;
		min-width: 0;
		align-items: center;
		justify-content: center;
		gap: 5px;
		padding: 0 7px;
		border: 0;
		border-radius: 3px;
		background: transparent;
		color: var(--kairo-ink-muted);
		font-size: 11px;
		font-weight: 600;
		transition: background-color 140ms ease, color 140ms ease, box-shadow 140ms ease;
	}

	.segment:hover {
		color: var(--kairo-ink);
	}

	.segment.active {
		background: var(--kairo-panel-raised);
		color: var(--kairo-ink);
		box-shadow: 0 0 0 1px var(--kairo-divider-soft), 0 1px 2px oklch(0.25 0.018 242 / 0.08);
	}

	.segment-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.swatch {
		height: 11px;
		width: 11px;
		flex: 0 0 auto;
		border: 1px solid oklch(0.25 0.018 242 / 0.14);
		border-radius: 50%;
	}
</style>
