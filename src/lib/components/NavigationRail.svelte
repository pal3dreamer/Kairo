<script lang="ts">
	import { Layers3, Library, PanelLeftClose, PanelLeftOpen } from '@lucide/svelte';
	import type { EditorDestination } from '$lib/editor/ui';

	let {
		destination,
		panelOpen,
		onchange,
		ontogglepanel,
	}: {
		destination: EditorDestination;
		panelOpen: boolean;
		onchange: (destination: EditorDestination) => void;
		ontogglepanel: () => void;
	} = $props();

	const destinations = [
		{ id: 'scene' as const, label: 'Scene', icon: Layers3 },
		{ id: 'assets' as const, label: 'Assets', icon: Library },
	];
</script>

<nav class="navigation-rail" aria-label="Editor navigation">
	<div class="rail-mark" aria-hidden="true">K</div>

	<div class="rail-destinations">
		{#each destinations as item (item.id)}
			{@const Icon = item.icon}
			<button
				type="button"
				data-showcase={`nav-${item.id}`}
				class:active={destination === item.id && panelOpen}
				class="rail-button"
				aria-label={item.label}
				aria-current={destination === item.id ? 'page' : undefined}
				data-tooltip={item.label}
				onclick={() => onchange(item.id)}
			>
				<Icon size={17} strokeWidth={1.7} />
			</button>
		{/each}
	</div>

	<div class="rail-spacer"></div>

	<button
		type="button"
		class="rail-button"
		aria-label={panelOpen ? 'Collapse panel' : 'Open panel'}
		data-tooltip={panelOpen ? 'Collapse panel' : 'Open panel'}
		onclick={ontogglepanel}
	>
		{#if panelOpen}
			<PanelLeftClose size={17} strokeWidth={1.7} />
		{:else}
			<PanelLeftOpen size={17} strokeWidth={1.7} />
		{/if}
	</button>
</nav>

<style>
	.navigation-rail {
		pointer-events: auto;
		display: flex;
		width: 52px;
		min-width: 52px;
		height: 100%;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 10px 0;
		border-right: 1px solid var(--kairo-divider);
		background: var(--kairo-rail);
	}

	.rail-mark {
		display: grid;
		height: 32px;
		width: 32px;
		margin-bottom: 6px;
		place-items: center;
		border: 1px solid color-mix(in oklch, var(--kairo-ink) 16%, transparent);
		border-radius: 5px;
		background: var(--kairo-ink);
		color: var(--kairo-panel-raised);
		font-family: var(--font-display);
		font-size: 13px;
		font-weight: 600;
	}

	.rail-destinations {
		display: grid;
		gap: 5px;
	}

	.rail-button {
		display: grid;
		height: 34px;
		width: 34px;
		place-items: center;
		border: 1px solid transparent;
		border-radius: 5px;
		background: transparent;
		color: var(--kairo-ink-muted);
		transition: background-color 140ms ease, color 140ms ease, border-color 140ms ease,
			transform 80ms ease;
	}

	.rail-button:hover {
		background: color-mix(in oklch, var(--kairo-panel-raised) 65%, transparent);
		color: var(--kairo-ink);
	}

	.rail-button:active {
		transform: translateY(1px);
	}

	.rail-button.active {
		border-color: transparent;
		background: var(--kairo-panel-raised);
		color: var(--kairo-sapphire-strong);
	}

	.rail-spacer {
		flex: 1;
	}

	@media (max-width: 720px) {
		.navigation-rail {
			width: 48px;
			min-width: 48px;
		}
	}
</style>
