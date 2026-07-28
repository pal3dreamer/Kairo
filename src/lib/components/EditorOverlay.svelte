<script lang="ts">
	import Toolbar from './Toolbar.svelte';
	import InspectorPanel from './InspectorPanel.svelte';
	import CameraPresets from './CameraPresets.svelte';
	import SceneGraph from './SceneGraph.svelte';

	let {
		mode,
		onmodechange,
		target,
		orbitControls,
		onpick,
		onclear,
		onreset,
		onpreset,
		hasImage,
	}: {
		mode: 'translate' | 'rotate' | 'scale';
		onmodechange: (mode: 'translate' | 'rotate' | 'scale') => void;
		target: import('three').Object3D | undefined;
		// @ts-expect-error
		orbitControls: import('three/examples/jsm/controls/OrbitControls').OrbitControls | undefined;
		onpick: (dataUrl: string) => void;
		onclear: () => void;
		onreset?: () => void;
		onpreset?: (pos: [number, number, number]) => void;
		hasImage: boolean;
	} = $props();

	let fileInput: HTMLInputElement | undefined = $state();

	function handlePick() {
		const file = fileInput?.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => onpick(reader.result as string);
		reader.readAsDataURL(file);
	}
</script>

<div class="absolute inset-0 pointer-events-none z-10 flex flex-col">
	<Toolbar {mode} {onmodechange} />
	<div class="flex flex-1 px-2 pb-2">
		<SceneGraph {target} />
		<div class="flex-1"></div>
		<div class="flex flex-col gap-2">
			<InspectorPanel {target} {onreset} />
			<CameraPresets {onpreset} />
			<div
				class="pointer-events-auto bg-white/90 rounded-lg shadow-lg backdrop-blur-sm border border-gray-200 p-3 w-56"
			>
				<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
					Screen
				</h3>
				<input
					bind:this={fileInput}
					type="file"
					accept="image/*"
					class="hidden"
					onchange={handlePick}
				/>
				<button
					onclick={() => fileInput?.click()}
					class="w-full rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-700"
				>
					Upload Screen
				</button>
				{#if hasImage}
					<button
						onclick={onclear}
						class="w-full mt-1 rounded-md bg-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-300"
					>
						Reset
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>
