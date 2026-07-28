<script lang="ts">
	import Scene from '$lib/components/Scene.svelte';

	let screenSrc = $state('');
</script>

<div class="relative h-screen w-screen">
	<Scene
		screenSrc={screenSrc}
		onpick={(dataUrl) => (screenSrc = dataUrl)}
		onclear={() => (screenSrc = '')}
	/>
</div>
