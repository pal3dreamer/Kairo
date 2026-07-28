<script lang="ts">
	import { onMount } from 'svelte';

	let {
		target,
		onreset,
	}: {
		target: import('three').Object3D | undefined;
		onreset?: () => void;
	} = $props();

	let posX = $state(0), posY = $state(0), posZ = $state(0);
	let rotX = $state(0), rotY = $state(0), rotZ = $state(0);
	let scaX = $state(0), scaY = $state(0), scaZ = $state(0);

	let updateInterval: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		updateInterval = setInterval(() => {
			if (!target) return;
			posX = +target.position.x.toFixed(4);
			posY = +target.position.y.toFixed(4);
			posZ = +target.position.z.toFixed(4);
			rotX = +(target.rotation.x * (180 / Math.PI)).toFixed(1);
			rotY = +(target.rotation.y * (180 / Math.PI)).toFixed(1);
			rotZ = +(target.rotation.z * (180 / Math.PI)).toFixed(1);
			scaX = +target.scale.x.toFixed(2);
			scaY = +target.scale.y.toFixed(2);
			scaZ = +target.scale.z.toFixed(2);
		}, 100);
		return () => clearInterval(updateInterval);
	});

	function setPos() {
		if (!target) return;
		target.position.set(posX, posY, posZ);
	}

	function setRot() {
		if (!target) return;
		target.rotation.set(
			rotX * (Math.PI / 180),
			rotY * (Math.PI / 180),
			rotZ * (Math.PI / 180),
		);
	}

	function setSca() {
		if (!target) return;
		target.scale.set(scaX, scaY, scaZ);
	}
</script>

<div
	class="pointer-events-auto bg-white/90 rounded-lg shadow-lg backdrop-blur-sm border border-gray-200 p-3 w-56"
>
	<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
		Transform
	</h3>

	<div class="space-y-2">
		<div>
			<span class="text-xs text-gray-400 block mb-0.5">Position</span>
			<div class="flex gap-1">
				<input
					type="number"
					step="0.01"
					bind:value={posX}
					oninput={setPos}
					aria-label="Position X"
					class="w-full px-1 py-0.5 text-xs border rounded bg-gray-50"
				/>
				<input
					type="number"
					step="0.01"
					bind:value={posY}
					oninput={setPos}
					aria-label="Position Y"
					class="w-full px-1 py-0.5 text-xs border rounded bg-gray-50"
				/>
				<input
					type="number"
					step="0.01"
					bind:value={posZ}
					oninput={setPos}
					aria-label="Position Z"
					class="w-full px-1 py-0.5 text-xs border rounded bg-gray-50"
				/>
			</div>
		</div>

		<div>
			<span class="text-xs text-gray-400 block mb-0.5">Rotation</span>
			<div class="flex gap-1">
				<input
					type="number"
					step="0.1"
					bind:value={rotX}
					oninput={setRot}
					aria-label="Rotation X"
					class="w-full px-1 py-0.5 text-xs border rounded bg-gray-50"
				/>
				<input
					type="number"
					step="0.1"
					bind:value={rotY}
					oninput={setRot}
					aria-label="Rotation Y"
					class="w-full px-1 py-0.5 text-xs border rounded bg-gray-50"
				/>
				<input
					type="number"
					step="0.1"
					bind:value={rotZ}
					oninput={setRot}
					aria-label="Rotation Z"
					class="w-full px-1 py-0.5 text-xs border rounded bg-gray-50"
				/>
			</div>
		</div>

		<div>
			<span class="text-xs text-gray-400 block mb-0.5">Scale</span>
			<div class="flex gap-1">
				<input
					type="number"
					step="0.01"
					bind:value={scaX}
					oninput={setSca}
					aria-label="Scale X"
					class="w-full px-1 py-0.5 text-xs border rounded bg-gray-50"
				/>
				<input
					type="number"
					step="0.01"
					bind:value={scaY}
					oninput={setSca}
					aria-label="Scale Y"
					class="w-full px-1 py-0.5 text-xs border rounded bg-gray-50"
				/>
				<input
					type="number"
					step="0.01"
					bind:value={scaZ}
					oninput={setSca}
					aria-label="Scale Z"
					class="w-full px-1 py-0.5 text-xs border rounded bg-gray-50"
				/>
			</div>
		</div>
	</div>

	{#if onreset}
		<button
			onclick={onreset}
			class="w-full mt-3 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-700"
		>
			Reset
		</button>
	{/if}
</div>
