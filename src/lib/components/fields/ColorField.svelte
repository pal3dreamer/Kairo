<script lang="ts">
	let {
		label,
		value,
		oninput,
	}: {
		label: string;
		value: string;
		oninput: (c: string) => void;
	} = $props();
</script>

<label class="color-row">
	<span class="color-label">{label}</span>
	<span class="color-control k-field">
		<span class="color-swatch" style={`background: ${value}`}></span>
		<span class="color-value">{value.toUpperCase()}</span>
		<input
			type="color"
			value={value}
			oninput={(e) => oninput(e.currentTarget.value)}
			aria-label={label}
			class="color-input"
		/>
	</span>
</label>

<style>
	.color-row {
		display: grid;
		grid-template-columns: 72px minmax(0, 1fr);
		align-items: center;
		gap: 8px;
	}

	.color-label {
		color: var(--kairo-ink-secondary);
		font-size: 12px;
	}

	.color-control {
		position: relative;
		display: flex;
		height: 28px;
		min-width: 0;
		align-items: center;
		gap: 7px;
		padding: 0 8px 0 5px;
		cursor: pointer;
	}

	.color-swatch {
		height: 18px;
		width: 24px;
		flex: 0 0 auto;
		border: 1px solid oklch(0.25 0.018 242 / 0.17);
		border-radius: 3px;
	}

	.color-value {
		overflow: hidden;
		color: var(--kairo-ink-muted);
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		text-overflow: ellipsis;
	}

	.color-input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
	}
</style>
