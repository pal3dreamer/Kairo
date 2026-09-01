<script lang="ts">
	import { Focus, Minus, Plus } from '@lucide/svelte';
	import type { PerspectiveCamera } from 'three';

	let {
		camera,
		onfit,
	}: {
		camera: PerspectiveCamera | undefined;
		onfit: () => void;
	} = $props();

	let zoom = $state(1);
	let trackedCamera: PerspectiveCamera | undefined;

	$effect(() => {
		if (camera && camera !== trackedCamera) {
			trackedCamera = camera;
			zoom = camera.zoom;
		}
	});

	function setZoom(next: number) {
		if (!camera) return;
		zoom = Math.max(0.5, Math.min(3, next));
		camera.zoom = zoom;
		camera.updateProjectionMatrix();
	}

	function fit() {
		onfit();
		setZoom(1);
	}
</script>

<div class="canvas-controls" aria-label="Canvas view controls">
	<button type="button" title="Zoom out" aria-label="Zoom out" onclick={() => setZoom(zoom - 0.1)}>
		<Minus size={13} strokeWidth={1.8} />
	</button>
	<button type="button" class="zoom-value" title="Reset zoom" onclick={() => setZoom(1)}>
		{Math.round(zoom * 100)}%
	</button>
	<button type="button" title="Zoom in" aria-label="Zoom in" onclick={() => setZoom(zoom + 0.1)}>
		<Plus size={13} strokeWidth={1.8} />
	</button>
	<span class="control-divider"></span>
	<button type="button" class="fit-button" title="Fit scene" onclick={fit}>
		<Focus size={13} strokeWidth={1.7} />
		<span>Fit</span>
	</button>
</div>

<style>
	.canvas-controls {
		pointer-events: auto;
		display: flex;
		height: 32px;
		align-items: center;
		gap: 1px;
		padding: 2px;
		border: 1px solid var(--kairo-divider);
		border-radius: 5px;
		background: color-mix(in oklch, var(--kairo-panel-raised) 97%, transparent);
		box-shadow: 0 3px 10px oklch(0.25 0.018 242 / 0.14);
		opacity: 0.96;
		transition: opacity 160ms ease, transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.canvas-controls:hover,
	.canvas-controls:focus-within {
		opacity: 1;
		transform: translateY(-1px);
	}

	.canvas-controls button {
		display: flex;
		height: 26px;
		min-width: 26px;
		align-items: center;
		justify-content: center;
		gap: 5px;
		padding: 0 6px;
		border: 0;
		border-radius: 3px;
		background: transparent;
		color: var(--kairo-ink-secondary);
		font-size: 10px;
		font-weight: 600;
	}

	.canvas-controls button:hover {
		background: var(--kairo-field);
		color: var(--kairo-ink);
	}

	.zoom-value {
		width: 43px;
		font-variant-numeric: tabular-nums;
	}

	.control-divider {
		height: 16px;
		width: 1px;
		margin: 0 2px;
		background: var(--kairo-divider);
	}

	.fit-button {
		padding-right: 8px !important;
	}

	@media (hover: none) {
		.canvas-controls {
			opacity: 0.86;
		}
	}
</style>
