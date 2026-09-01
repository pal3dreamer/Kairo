<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';

	let {
		title,
		open = true,
		summary,
		showcaseId,
		children,
	}: {
		title: string;
		open?: boolean;
		summary?: string;
		showcaseId?: string;
		children: import('svelte').Snippet;
	} = $props();

	const initialOpen = () => open;
	let isOpen = $state(initialOpen());
</script>

<section data-showcase={showcaseId} class="section">
	<button
		type="button"
		data-section-toggle
		class="section-toggle"
		onclick={() => (isOpen = !isOpen)}
		aria-expanded={isOpen}
	>
		<span class="section-title">{title}</span>
		<span class="section-end">
			{#if summary}<span class="section-summary">{summary}</span>{/if}
			<ChevronDown size={14} strokeWidth={1.7} class={isOpen ? 'is-open' : ''} />
		</span>
	</button>
	<div class="section-reveal" data-open={isOpen} aria-hidden={!isOpen} inert={!isOpen}>
		<div class="section-clip">
			<div class="section-content">
				{@render children()}
			</div>
		</div>
	</div>
</section>

<style>
	.section {
		border-bottom: 1px solid var(--kairo-divider-soft);
	}

	.section:last-child {
		border-bottom: 0;
	}

	.section-toggle {
		display: flex;
		width: 100%;
		height: 36px;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 0 12px;
		border: 0;
		background: transparent;
		color: var(--kairo-ink-secondary);
		text-align: left;
		transition: background-color 140ms ease, color 140ms ease;
	}

	.section-toggle:hover {
		background: color-mix(in oklch, var(--kairo-field) 68%, transparent);
		color: var(--kairo-ink);
	}

	.section-title {
		font-family: var(--font-display);
		font-size: 12px;
		font-weight: 600;
		line-height: 1;
	}

	.section-end {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 7px;
	}

	.section-summary {
		overflow: hidden;
		color: var(--kairo-ink-muted);
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.section-end :global(svg) {
		flex: 0 0 auto;
		color: var(--kairo-ink-faint);
		transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.section-end :global(svg.is-open) {
		transform: rotate(180deg);
	}

	.section-reveal {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;
		transition: grid-template-rows 200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease;
	}

	.section-reveal[data-open='true'] {
		grid-template-rows: 1fr;
		opacity: 1;
	}

	.section-clip {
		min-height: 0;
		overflow: hidden;
	}

	.section-content {
		min-width: 0;
		padding: 2px 12px 12px;
	}
</style>
