<script lang="ts">
	let {
		label,
		value,
		min,
		max,
		step = 0.01,
		onchange,
		format,
	}: {
		label: string;
		value: number;
		min: number;
		max: number;
		step?: number;
		onchange: (v: number) => void;
		format?: (v: number) => string;
	} = $props();

	function onChange(e: Event) {
		const v = +((e.currentTarget as HTMLInputElement).value);
		onchange(Number.isNaN(v) ? value : v);
	}

	const progress = $derived(Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100)));
</script>

<label class="control-row">
	<span class="control-label">{label}</span>
	<input
		data-showcase-control={label}
		type="range"
		{min}
		{max}
		{step}
		value={value}
		oninput={onChange}
		class="range"
		style={`--range-progress: ${progress}%`}
	/>
	<output class="control-value">{format ? format(value) : value}</output>
</label>

<style>
	.control-row {
		display: grid;
		min-width: 0;
		min-height: 30px;
		grid-template-columns: 72px minmax(0, 1fr) 48px;
		align-items: center;
		gap: 8px;
	}

	.control-label {
		min-width: 0;
		overflow: hidden;
		color: var(--kairo-ink-secondary);
		font-size: 12px;
		line-height: 1.2;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.control-value {
		min-width: 0;
		color: var(--kairo-ink-muted);
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		text-align: right;
	}

	.range {
		width: 100%;
		min-width: 0;
		height: 14px;
		margin: 0;
		appearance: none;
		background: transparent;
		cursor: ew-resize;
	}

	.range::-webkit-slider-runnable-track {
		height: 3px;
		border-radius: 999px;
		background: linear-gradient(
			to right,
			var(--kairo-sapphire) 0,
			var(--kairo-sapphire) var(--range-progress),
			var(--kairo-divider) var(--range-progress),
			var(--kairo-divider) 100%
		);
	}

	.range::-moz-range-track {
		height: 3px;
		border-radius: 999px;
		background: var(--kairo-divider);
	}

	.range::-moz-range-progress {
		height: 3px;
		border-radius: 999px;
		background: var(--kairo-sapphire);
	}

	.range::-webkit-slider-thumb {
		height: 11px;
		width: 11px;
		margin-top: -4px;
		appearance: none;
		border: 1px solid color-mix(in oklch, var(--kairo-sapphire) 65%, var(--kairo-ink));
		border-radius: 50%;
		background: var(--kairo-panel-raised);
		box-shadow: 0 1px 2px oklch(0.25 0.018 242 / 0.18);
	}

	.range::-moz-range-thumb {
		height: 11px;
		width: 11px;
		border: 1px solid color-mix(in oklch, var(--kairo-sapphire) 65%, var(--kairo-ink));
		border-radius: 50%;
		background: var(--kairo-panel-raised);
		box-shadow: 0 1px 2px oklch(0.25 0.018 242 / 0.18);
	}

	.range:focus-visible {
		outline-offset: 0;
	}
</style>
