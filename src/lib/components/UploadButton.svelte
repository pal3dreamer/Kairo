<script lang="ts">
	let { onpick, onclear }: { onpick: (dataUrl: string) => void; onclear: () => void } = $props();

	let fileInput: HTMLInputElement | undefined = $state();
	let hasImage = $state(false);

	function handlePick() {
		const file = fileInput?.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			onpick(reader.result as string);
			hasImage = true;
		};
		reader.readAsDataURL(file);
	}
</script>

<div class="fixed bottom-6 right-6 z-50 flex gap-2">
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		class="hidden"
		onchange={handlePick}
	/>
	<button
		onclick={() => fileInput?.click()}
		class="cursor-pointer rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-neutral-700"
	>
		Upload Screen
	</button>
	{#if hasImage}
		<button
			onclick={() => { hasImage = false; onclear(); }}
			class="cursor-pointer rounded-full bg-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-lg transition hover:bg-neutral-300"
		>
			Reset
		</button>
	{/if}
</div>
