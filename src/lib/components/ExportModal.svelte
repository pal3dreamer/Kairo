<script lang="ts">
	import { onMount } from 'svelte';
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
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
	role="presentation"
	onclick={(event) => {
		if (event.target === event.currentTarget && !exporting) onclose();
	}}
>
	<div
		class="w-full max-w-md rounded-lg border border-gray-200 bg-[var(--kairo-base)] p-5 shadow-2xl"
		role="dialog"
		aria-modal="true"
		aria-labelledby="export-title"
	>
		<div class="flex items-start justify-between gap-4">
			<div>
				<h2 id="export-title" class="text-sm font-semibold text-neutral-900">Export image</h2>
				<p class="mt-0.5 text-[11px] text-gray-400">Choose exact output dimensions and format.</p>
			</div>
			<button
				type="button"
				class="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-neutral-900"
				title="Close export"
				aria-label="Close export"
				disabled={exporting}
				onclick={onclose}
			>
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
					<path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
				</svg>
			</button>
		</div>

		<div class="mt-5">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Presets</span>
				<span class="text-[11px] tabular-nums text-gray-500">{width} x {height}</span>
			</div>
			<div class="grid grid-cols-3 gap-1.5">
				{#each exportPresets as preset (preset.id)}
					<button
						type="button"
						disabled={exporting}
						title={preset.description}
						class="flex min-h-14 flex-col items-start justify-center rounded-md border px-2 text-left transition-colors {selectedPreset === preset.id
							? 'border-[var(--kairo-sapphire)] bg-[var(--kairo-sapphire-soft)] text-[var(--kairo-sapphire-strong)]'
							: 'border-gray-200 bg-white text-neutral-600 hover:bg-gray-100'}"
						onclick={() => selectPreset(preset.id)}
					>
						<span class="text-[11px] font-semibold">{preset.label}</span>
						<span class="mt-0.5 text-[10px] text-gray-400">{presetDimensions(preset.id)}</span>
					</button>
				{/each}
				<button
					type="button"
					disabled={exporting}
					title="Set custom dimensions"
					class="flex min-h-14 flex-col items-start justify-center rounded-md border px-2 text-left transition-colors {selectedPreset === 'custom'
						? 'border-[var(--kairo-sapphire)] bg-[var(--kairo-sapphire-soft)] text-[var(--kairo-sapphire-strong)]'
						: 'border-gray-200 bg-white text-neutral-600 hover:bg-gray-100'}"
					onclick={() => (selectedPreset = 'custom')}
				>
					<span class="text-[11px] font-semibold">Custom</span>
					<span class="mt-0.5 text-[10px] text-gray-400">Set dimensions</span>
				</button>
			</div>
		</div>

		<div class="mt-5 border-t border-gray-200 pt-4">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Dimensions</span>
				<span class="text-[11px] tabular-nums text-gray-500">{megapixels.toFixed(1)} MP / {ratioLabel()}</span>
			</div>
			<div class="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
				<label class="block text-[11px] text-gray-500">
					Width
					<input
						type="number"
						min="1"
						max={EXPORT_MAX_DIMENSION}
						step="1"
						value={width}
						disabled={exporting}
						oninput={(event) => setCustomWidth((event.currentTarget as HTMLInputElement).value)}
						class="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-[12px] tabular-nums text-neutral-700 outline-none focus:border-[var(--kairo-sapphire)]"
					/>
				</label>
				<button
					type="button"
					disabled={exporting}
					class="mb-1 flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-400 transition-colors hover:bg-gray-100 hover:text-neutral-800 {lockAspect ? 'border-[var(--kairo-sapphire)] text-[var(--kairo-sapphire)]' : ''}"
					title={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
					aria-label={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
					onclick={toggleAspectLock}
				>
				{#if lockAspect}
					<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d="M5.2 7V5.2a2.8 2.8 0 0 1 5.6 0V7M4 7h8v6H4V7Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
					</svg>
				{:else}
					<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d="M5.2 7V5.2a2.8 2.8 0 0 1 5.6 0" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
						<path d="M4 7h8v6H4V7Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
					</svg>
				{/if}
				</button>
				<label class="block text-[11px] text-gray-500">
					Height
					<input
						type="number"
						min="1"
						max={EXPORT_MAX_DIMENSION}
						step="1"
						value={height}
						disabled={exporting}
						oninput={(event) => setCustomHeight((event.currentTarget as HTMLInputElement).value)}
						class="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-[12px] tabular-nums text-neutral-700 outline-none focus:border-[var(--kairo-sapphire)]"
					/>
				</label>
			</div>
		</div>

		<div class="mt-5 border-t border-gray-200 pt-4">
			<div class="grid grid-cols-2 gap-4">
				<label class="block text-[11px] text-gray-500">
					Format
					<select
						value={format}
						disabled={exporting}
						onchange={(event) => setFormat((event.currentTarget as HTMLSelectElement).value)}
						class="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-[12px] text-neutral-700 outline-none focus:border-[var(--kairo-sapphire)]"
					>
						{#each exportFormats as option (option.id)}
							<option value={option.id}>{option.label} (.{option.extension})</option>
						{/each}
					</select>
				</label>

				<label class="flex items-end gap-2 pb-1 text-[11px] text-gray-500">
					<input
						type="checkbox"
						checked={transparent}
						disabled={exporting || format === 'jpeg'}
						onchange={(event) => (transparent = (event.currentTarget as HTMLInputElement).checked)}
						class="h-3.5 w-3.5 accent-[var(--kairo-sapphire)]"
					/>
					<span class={format === 'jpeg' ? 'text-gray-300' : ''}>Transparent background</span>
				</label>
			</div>

			{#if format !== 'png'}
				<div class="mt-4 flex items-center gap-3">
					<span class="w-14 shrink-0 text-[11px] text-gray-500">Quality</span>
					<input
						type="range"
						min="0.1"
						max="1"
						step="0.01"
						value={quality}
						disabled={exporting}
						oninput={(event) => (quality = +(event.currentTarget as HTMLInputElement).value)}
						class="h-1 flex-1 accent-[var(--kairo-sapphire)]"
					/>
					<span class="w-10 text-right text-[11px] tabular-nums text-gray-500">{Math.round(quality * 100)}%</span>
				</div>
			{/if}
		</div>

		{#if error}
			<p class="mt-4 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-[11px] text-red-700" role="alert">{error}</p>
		{/if}

		<button
			type="button"
			class="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--kairo-sapphire)] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--kairo-sapphire-strong)] disabled:cursor-not-allowed disabled:opacity-50"
			disabled={exporting || !capture}
			onclick={download}
		>
			{#if exporting}
				<span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
				Rendering {width} x {height}...
			{:else}
				<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path d="M8 1.5v8m0 0 3-3m-3 3-3-3M2.5 10.5v1.2A2.8 2.8 0 0 0 5.3 14.5h5.4a2.8 2.8 0 0 0 2.8-2.8v-1.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				Download {format.toUpperCase()}
			{/if}
		</button>
	</div>
</div>
