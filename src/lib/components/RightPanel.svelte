<script lang="ts">
	import { getEditorState } from '$lib/editor/state.svelte';
	import PhoneInspector from './inspectors/PhoneInspector.svelte';
	import BackgroundInspector from './inspectors/BackgroundInspector.svelte';
	import LightsInspector from './inspectors/LightsInspector.svelte';
	import CameraInspector from './inspectors/CameraInspector.svelte';

	let {
		target,
		camera,
		onreset,
		onpreset,
	}: {
		target: import('three').Object3D | undefined;
		camera: import('three').PerspectiveCamera | undefined;
		onreset?: () => void;
		onpreset?: (pos: [number, number, number]) => void;
	} = $props();

	const editor = getEditorState();
</script>

<div
	class="pointer-events-auto flex h-full w-80 shrink-0 flex-col overflow-x-hidden overflow-y-auto border-l border-gray-200 bg-[var(--kairo-mantle)]"
>
	{#if editor.selection === 'phone'}
		<div class="border-b border-gray-100 px-3.5 py-2.5">
			<h2 class="text-[13px] font-semibold text-neutral-900">{editor.modelName}</h2>
			<p class="mt-0.5 text-[11px] text-gray-400">Selected</p>
		</div>
		<PhoneInspector {target} {onreset} />
	{:else if editor.selection === 'background'}
		<div class="border-b border-gray-100 px-3.5 py-2.5">
			<h2 class="text-[13px] font-semibold text-neutral-900">Background</h2>
			<p class="mt-0.5 text-[11px] text-gray-400">Selected</p>
		</div>
		<BackgroundInspector />
	{:else if editor.selection === 'lights'}
		<div class="border-b border-gray-100 px-3.5 py-2.5">
			<h2 class="text-[13px] font-semibold text-neutral-900">Lights</h2>
			<p class="mt-0.5 text-[11px] text-gray-400">Selected</p>
		</div>
		<LightsInspector />
	{:else if editor.selection === 'camera'}
		<div class="border-b border-gray-100 px-3.5 py-2.5">
			<h2 class="text-[13px] font-semibold text-neutral-900">Camera</h2>
			<p class="mt-0.5 text-[11px] text-gray-400">Selected</p>
		</div>
		<CameraInspector {camera} {onpreset} />
	{:else}
		<div class="flex flex-1 flex-col items-center justify-center p-4 text-center">
			<h2 class="text-[13px] font-semibold text-neutral-900">Nothing selected</h2>
			<p class="mt-1 text-[12px] text-gray-400">Select an object</p>
			<div class="mt-2 text-[14px] leading-none text-gray-300">↓</div>
			<p class="mt-2 text-[12px] text-gray-400">Properties appear here.</p>
		</div>
	{/if}
</div>
