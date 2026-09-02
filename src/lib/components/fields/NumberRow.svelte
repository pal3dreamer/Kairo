<script lang="ts">
	let {
		label,
		x,
		y,
		z,
		step = 0.01,
		onchange,
	}: {
		label: string;
		x: number;
		y: number;
		z: number;
		step?: number;
		onchange: (x: number, y: number, z: number) => void;
	} = $props();
</script>

<div class="number-row">
	<span class="number-label">{label}</span>
	<div class="number-fields">
		{#each [
			{ v: x, axis: 'X' },
			{ v: y, axis: 'Y' },
			{ v: z, axis: 'Z' },
		] as field, i}
			<label class="number-field">
				<span class="axis">
					{field.axis}
				</span>
				<input
					type="number"
					step={step}
					value={field.v}
					oninput={(e) => {
						const n = +(e.currentTarget.value);
						if (Number.isNaN(n)) return;
						if (i === 0) onchange(n, y, z);
						else if (i === 1) onchange(x, n, z);
						else onchange(x, y, n);
					}}
					aria-label={`${label} ${field.axis}`}
					class="k-field value-input"
				/>
			</label>
		{/each}
	</div>
</div>

<style>
	.number-row {
		display: grid;
		grid-template-columns: 58px minmax(0, 1fr);
		align-items: center;
		gap: 8px;
	}

	.number-label {
		color: var(--kairo-ink-secondary);
		font-size: 12px;
	}

	.number-fields {
		display: grid;
		min-width: 0;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 4px;
	}

	.number-field {
		position: relative;
		min-width: 0;
	}

	.axis {
		position: absolute;
		z-index: 1;
		left: 6px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--kairo-ink-faint);
		font-size: 9px;
		font-weight: 600;
		pointer-events: none;
	}

	.value-input {
		width: 100%;
		height: 27px;
		min-width: 0;
		padding: 0 4px 0 17px;
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		outline: none;
	}
</style>
