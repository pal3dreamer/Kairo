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

<div class="swatch-row">
	{#each options as opt (opt.id)}
		<button
			data-showcase-option={opt.id}
			title={opt.label}
			aria-label={opt.label}
			aria-pressed={value === opt.id}
			class:active={value === opt.id}
			class="swatch-button"
			onclick={() => onchange(opt.id)}
		>
			<span class="swatch" style={`background: ${opt.swatch}`}></span>
		</button>
	{/each}
</div>

<style>
	.swatch-row {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
	}

	.swatch-button {
		display: grid;
		height: 28px;
		width: 28px;
		place-items: center;
		border: 1px solid transparent;
		border-radius: 50%;
		background: transparent;
		transition: border-color 140ms ease, background-color 140ms ease, transform 80ms ease;
	}

	.swatch-button:hover {
		background: var(--kairo-field-hover);
	}

	.swatch-button:active {
		transform: translateY(1px);
	}

	.swatch-button.active {
		border-color: var(--kairo-sapphire);
		background: var(--kairo-sapphire-faint);
	}

	.swatch {
		height: 20px;
		width: 20px;
		border: 1px solid oklch(0.25 0.018 242 / 0.18);
		border-radius: 50%;
		box-shadow: inset 0 0 0 1px oklch(0.98 0.004 242 / 0.32);
	}
</style>
