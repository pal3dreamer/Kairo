<script lang="ts">
	import { onMount } from 'svelte';
	import { Download, Link, Link2Off, LoaderCircle, X } from '@lucide/svelte';
	import {
		dimensionsForPreset,
		exportFileName,
		exportFormats,
		exportPresets,
		EXPORT_MAX_DIMENSION,
		type ExportFormat,
		type ExportPresetId,
		type ExportSettings,
		type ViewportSize,
	} from '$lib/export';

	let {
		onclose,
		capture,
		getViewport,
		filename = 'kairo',
	}: {
		onclose: () => void;
		capture?: (settings: ExportSettings) => Promise<Blob>;
		getViewport?: () => ViewportSize;
		filename?: string;
	} = $props();

	type PresetSelection = ExportPresetId | 'custom';

	function readViewport(): ViewportSize {
		return getViewport ? getViewport() : { width: 1280, height: 720 };
	}

	const viewport = readViewport();
	const initialDimensions = dimensionsForPreset('viewport-1x', viewport);

	let selectedPreset = $state<PresetSelection>('viewport-1x');
	let width = $state(initialDimensions.width);
	let height = $state(initialDimensions.height);
	let aspect = $state(initialDimensions.width / initialDimensions.height);
	let lockAspect = $state(true);
	let format = $state<ExportFormat>('png');
	let quality = $state(0.92);
	let transparent = $state(false);
	let exporting = $state(false);
	let error = $state('');

	const megapixels = $derived((width * height) / 1_000_000);

	function clampDimension(value: number): number {
		return Math.max(1, Math.min(EXPORT_MAX_DIMENSION, Math.round(value)));
	}

	function parseDimension(raw: string, fallback: number): number {
		const value = Number.parseInt(raw, 10);
		return Number.isFinite(value) ? clampDimension(value) : fallback;
	}

	function selectPreset(id: ExportPresetId) {
		const dimensions = dimensionsForPreset(id, viewport);
		selectedPreset = id;
		width = dimensions.width;
		height = dimensions.height;
		aspect = dimensions.width / dimensions.height;
	}

	function setCustomWidth(raw: string) {
		const nextWidth = parseDimension(raw, width);
		selectedPreset = 'custom';
		width = nextWidth;
		if (lockAspect) height = clampDimension(nextWidth / aspect);
	}

	function setCustomHeight(raw: string) {
		const nextHeight = parseDimension(raw, height);
		selectedPreset = 'custom';
		height = nextHeight;
		if (lockAspect) width = clampDimension(nextHeight * aspect);
	}

	function toggleAspectLock() {
		lockAspect = !lockAspect;
		if (lockAspect) aspect = width / height;
	}

	function setFormat(value: string) {
		if (value !== 'png' && value !== 'jpeg' && value !== 'webp') return;
		format = value;
		if (value === 'jpeg') transparent = false;
	}

	function ratioLabel() {
		const ratio = width / height;
		if (!Number.isFinite(ratio)) return '0:0';
		const rounded = Math.round(ratio * 100) / 100;
		return `${rounded}:1`;
	}

	function presetDimensions(id: ExportPresetId): string {
		const dimensions = dimensionsForPreset(id, viewport);
		return `${dimensions.width} x ${dimensions.height}`;
	}

	async function download() {
		if (!capture || exporting) return;

		exporting = true;
		error = '';
		try {
			const blob = await capture({
				width,
				height,
				format,
				quality,
				transparent: format === 'jpeg' ? false : transparent,
			});
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement('a');
			anchor.href = url;
			anchor.download = exportFileName(filename, format);
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			window.setTimeout(() => URL.revokeObjectURL(url), 0);
			onclose();
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Could not export the image.';
		} finally {
			exporting = false;
		}
	}

	onMount(() => {
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && !exporting) onclose();
		};
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div
	class="export-backdrop"
	role="presentation"
	onclick={(event) => {
		if (event.target === event.currentTarget && !exporting) onclose();
	}}
>
	<div
		data-showcase="export-modal"
		class="export-dialog"
		role="dialog"
		aria-modal="true"
		aria-labelledby="export-title"
	>
		<header class="dialog-header">
			<div>
				<span>Output</span>
				<h2 id="export-title">Export image</h2>
			</div>
			<button type="button" class="k-icon-button" title="Close export" aria-label="Close export" disabled={exporting} onclick={onclose}>
				<X size={15} strokeWidth={1.7} />
			</button>
		</header>

		<div class="dialog-body kairo-scrollbar">
			<section class="export-section first">
				<div class="section-title">
					<h3>Presets</h3>
					<span>{width} x {height}</span>
				</div>
				<div class="preset-grid">
					{#each exportPresets as preset (preset.id)}
						<button
							data-showcase-option={preset.id}
							type="button"
							disabled={exporting}
							title={preset.description}
							class:active={selectedPreset === preset.id}
							class="export-preset"
							onclick={() => selectPreset(preset.id)}
						>
							<span class="preset-frame" aria-hidden="true"></span>
							<strong>{preset.label}</strong>
							<small>{presetDimensions(preset.id)}</small>
						</button>
					{/each}
					<button
						type="button"
						disabled={exporting}
						class:active={selectedPreset === 'custom'}
						class="export-preset"
						onclick={() => (selectedPreset = 'custom')}
					>
						<span class="preset-frame custom" aria-hidden="true"></span>
						<strong>Custom</strong>
						<small>{width} x {height}</small>
					</button>
				</div>
			</section>

			<section class="export-section">
				<div class="section-title">
					<h3>Dimensions</h3>
					<span>{megapixels.toFixed(1)} MP / {ratioLabel()}</span>
				</div>
				<div class="dimension-grid">
					<label>
						<span>Width</span>
						<input
							type="number"
							min="1"
							max={EXPORT_MAX_DIMENSION}
							step="1"
							value={width}
							disabled={exporting}
							oninput={(event) => setCustomWidth((event.currentTarget as HTMLInputElement).value)}
							class="k-field"
						/>
					</label>
					<button
						type="button"
						disabled={exporting}
						class:active={lockAspect}
						class="aspect-lock"
						title={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
						aria-label={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
						onclick={toggleAspectLock}
					>
						{#if lockAspect}<Link size={14} strokeWidth={1.7} />{:else}<Link2Off size={14} strokeWidth={1.7} />{/if}
					</button>
					<label>
						<span>Height</span>
						<input
							type="number"
							min="1"
							max={EXPORT_MAX_DIMENSION}
							step="1"
							value={height}
							disabled={exporting}
							oninput={(event) => setCustomHeight((event.currentTarget as HTMLInputElement).value)}
							class="k-field"
						/>
					</label>
				</div>
			</section>

			<section class="export-section">
				<div class="format-grid">
					<label class="format-field">
						<span>Format</span>
						<select
							value={format}
							disabled={exporting}
							onchange={(event) => setFormat((event.currentTarget as HTMLSelectElement).value)}
							class="k-field"
						>
							{#each exportFormats as option (option.id)}
								<option value={option.id}>{option.label} (.{option.extension})</option>
							{/each}
						</select>
					</label>

					<label class:disabled={format === 'jpeg'} class="toggle-row">
						<span>Transparent</span>
						<input
							type="checkbox"
							checked={transparent}
							disabled={exporting || format === 'jpeg'}
							onchange={(event) => (transparent = (event.currentTarget as HTMLInputElement).checked)}
						/>
						<span class="toggle" aria-hidden="true"><span></span></span>
					</label>
				</div>

				{#if format !== 'png'}
					<label class="quality-row">
						<span>Quality</span>
						<input
							type="range"
							min="0.1"
							max="1"
							step="0.01"
							value={quality}
							disabled={exporting}
							oninput={(event) => (quality = +(event.currentTarget as HTMLInputElement).value)}
						/>
						<output>{Math.round(quality * 100)}%</output>
					</label>
				{/if}
			</section>

			{#if error}<p class="export-error" role="alert">{error}</p>{/if}
		</div>

		<footer class="dialog-footer">
			<span>{width} x {height} / {format.toUpperCase()}</span>
			<button data-showcase="export-download" type="button" disabled={exporting || !capture} onclick={download}>
				{#if exporting}
					<LoaderCircle size={14} strokeWidth={1.8} class="spinner" />
					Rendering
				{:else}
					<Download size={14} strokeWidth={1.8} />
					Download
				{/if}
			</button>
		</footer>
	</div>
</div>

<style>
	.export-backdrop {
		position: fixed;
		z-index: 50;
		inset: 0;
		display: grid;
		place-items: center;
		padding: 16px;
		background: oklch(0.25 0.018 242 / 0.34);
	}

	.export-dialog {
		display: flex;
		width: min(472px, 100%);
		max-height: min(760px, calc(100vh - 32px));
		flex-direction: column;
		overflow: hidden;
		border: 1px solid var(--kairo-divider);
		border-radius: 6px;
		background: var(--kairo-panel);
		box-shadow: 0 24px 64px oklch(0.22 0.018 242 / 0.28);
	}

	.dialog-header {
		display: flex;
		height: 58px;
		min-height: 58px;
		align-items: center;
		justify-content: space-between;
		padding: 0 12px 0 15px;
		border-bottom: 1px solid var(--kairo-divider);
	}

	.dialog-header > div {
		display: grid;
		gap: 3px;
	}

	.dialog-header span,
	.section-title h3 {
		color: var(--kairo-ink-muted);
		font-size: 10px;
		font-weight: 600;
		line-height: 1;
		text-transform: uppercase;
	}

	.dialog-header h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 14px;
		font-weight: 600;
	}

	.dialog-body {
		min-height: 0;
		overflow-y: auto;
	}

	.export-section {
		padding: 16px;
		border-top: 1px solid var(--kairo-divider-soft);
	}

	.export-section.first {
		border-top: 0;
	}

	.section-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 10px;
	}

	.section-title h3 {
		margin: 0;
	}

	.section-title span,
	.dialog-footer > span {
		color: var(--kairo-ink-muted);
		font-size: 10px;
		font-variant-numeric: tabular-nums;
	}

	.preset-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 6px;
	}

	.export-preset {
		display: grid;
		min-width: 0;
		grid-template-columns: 28px minmax(0, 1fr);
		grid-template-rows: auto auto;
		align-items: center;
		column-gap: 7px;
		padding: 7px;
		border: 1px solid var(--kairo-divider-soft);
		border-radius: 5px;
		background: transparent;
		color: var(--kairo-ink-secondary);
		text-align: left;
	}

	.export-preset:hover {
		background: var(--kairo-field);
		color: var(--kairo-ink);
	}

	.export-preset.active {
		border-color: var(--kairo-sapphire);
		background: var(--kairo-sapphire-faint);
	}

	.preset-frame {
		grid-row: 1 / 3;
		display: block;
		height: 22px;
		width: 28px;
		border: 1px solid var(--kairo-ink-faint);
		border-radius: 2px;
		background: var(--kairo-panel-raised);
	}

	.preset-frame.custom {
		border-style: dashed;
	}

	.export-preset strong,
	.export-preset small {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.export-preset strong {
		font-size: 10px;
		font-weight: 600;
	}

	.export-preset small {
		color: var(--kairo-ink-muted);
		font-size: 9px;
		font-variant-numeric: tabular-nums;
	}

	.dimension-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 30px minmax(0, 1fr);
		align-items: end;
		gap: 8px;
	}

	.dimension-grid label,
	.format-field {
		display: grid;
		gap: 5px;
		color: var(--kairo-ink-secondary);
		font-size: 11px;
	}

	.dimension-grid input,
	.format-field select {
		height: 30px;
		width: 100%;
		min-width: 0;
		padding: 0 8px;
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		outline: none;
	}

	.aspect-lock {
		display: grid;
		height: 30px;
		width: 30px;
		place-items: center;
		border: 1px solid var(--kairo-divider);
		border-radius: 4px;
		background: transparent;
		color: var(--kairo-ink-muted);
	}

	.aspect-lock:hover {
		background: var(--kairo-field);
		color: var(--kairo-ink);
	}

	.aspect-lock.active {
		border-color: var(--kairo-sapphire);
		color: var(--kairo-sapphire-strong);
	}

	.format-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		align-items: end;
		gap: 20px;
	}

	.toggle-row {
		display: flex;
		height: 30px;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		color: var(--kairo-ink-secondary);
		font-size: 11px;
		cursor: pointer;
	}

	.toggle-row.disabled {
		color: var(--kairo-ink-faint);
	}

	.toggle-row input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.toggle {
		position: relative;
		display: block;
		height: 17px;
		width: 30px;
		border: 1px solid var(--kairo-divider);
		border-radius: 999px;
		background: var(--kairo-field-hover);
		transition: border-color 140ms ease, background-color 140ms ease;
	}

	.toggle span {
		position: absolute;
		left: 2px;
		top: 2px;
		height: 11px;
		width: 11px;
		border-radius: 50%;
		background: var(--kairo-panel-raised);
		box-shadow: 0 1px 2px oklch(0.25 0.018 242 / 0.2);
		transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.toggle-row input:checked + .toggle {
		border-color: var(--kairo-sapphire);
		background: var(--kairo-sapphire);
	}

	.toggle-row input:checked + .toggle span {
		transform: translateX(13px);
	}

	.quality-row {
		display: grid;
		grid-template-columns: 60px minmax(0, 1fr) 38px;
		align-items: center;
		gap: 8px;
		margin-top: 14px;
		color: var(--kairo-ink-secondary);
		font-size: 11px;
	}

	.quality-row input {
		accent-color: var(--kairo-sapphire);
	}

	.quality-row output {
		color: var(--kairo-ink-muted);
		font-variant-numeric: tabular-nums;
		text-align: right;
	}

	.export-error {
		margin: 0 16px 16px;
		padding: 8px 10px;
		border: 1px solid color-mix(in oklch, var(--kairo-danger) 30%, transparent);
		border-radius: 4px;
		background: var(--kairo-danger-soft);
		color: var(--kairo-danger);
		font-size: 11px;
	}

	.dialog-footer {
		display: flex;
		height: 54px;
		min-height: 54px;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 0 12px 0 16px;
		border-top: 1px solid var(--kairo-divider);
		background: var(--kairo-panel-raised);
	}

	.dialog-footer button {
		display: flex;
		height: 32px;
		align-items: center;
		justify-content: center;
		gap: 7px;
		padding: 0 13px;
		border: 1px solid var(--kairo-ink);
		border-radius: 4px;
		background: var(--kairo-ink);
		color: var(--kairo-panel-raised);
		font-size: 11px;
		font-weight: 600;
	}

	.dialog-footer button:hover {
		background: color-mix(in oklch, var(--kairo-ink) 88%, var(--kairo-sapphire));
	}

	:global(.spinner) {
		animation: spin 700ms linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@media (max-width: 520px) {
		.export-backdrop {
			align-items: end;
			padding: 8px;
		}

		.export-dialog {
			max-height: calc(100vh - 16px);
		}

		.preset-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
