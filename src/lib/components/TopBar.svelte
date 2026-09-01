<script lang="ts">
	import { onMount } from 'svelte';
	import { getEditorState, type TransformMode } from '$lib/editor/state.svelte';

	let {
		onexport,
		onsave,
		onopen,
	}: {
		onexport?: () => void;
		onsave?: () => void;
		onopen?: () => void;
	} = $props();

	const editor = getEditorState();

	let projectName = $state(editor.projectName);
	let menuOpen = $state(false);
	let menu: HTMLDivElement | undefined = $state();

	const tools: { id: TransformMode; label: string; key: string }[] = [
		{ id: 'none', label: 'Select', key: 'V' },
		{ id: 'translate', label: 'Move', key: 'W' },
		{ id: 'rotate', label: 'Rotate', key: 'E' },
		{ id: 'scale', label: 'Scale', key: 'R' },
	];

	function handleKeydown(e: KeyboardEvent) {
		if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
		const k = e.key.toLowerCase();
		if (k === 'v') editor.setTransform('none');
		else if (k === 'w') editor.setTransform('translate');
		else if (k === 'e') editor.setTransform('rotate');
		else if (k === 'r') editor.setTransform('scale');
		else if (k === 'escape') {
			menuOpen = false;
			editor.setTransform('none');
		}
	}

	function closeMenuOnOutsideClick(event: PointerEvent) {
		if (menu && !menu.contains(event.target as Node)) menuOpen = false;
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('pointerdown', closeMenuOnOutsideClick);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.removeEventListener('pointerdown', closeMenuOnOutsideClick);
		};
	});
</script>

<header
	class="pointer-events-auto flex h-12 shrink-0 items-center gap-1 border-b border-gray-200 bg-[var(--kairo-mantle)] px-2"
>
	<!-- App / project -->
	<div class="flex items-center gap-1.5" bind:this={menu}>
		<div class="relative">
			<button
				class="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-neutral-900"
				title="File menu"
				aria-label="File menu"
				aria-haspopup="menu"
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
			>
				<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
					<path d="M1.5 3.5h12M1.5 7.5h12M1.5 11.5h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
				</svg>
			</button>
			{#if menuOpen}
				<div class="absolute left-0 top-8 z-50 w-36 rounded-md border border-gray-200 bg-[var(--kairo-base)] p-1 shadow-lg" role="menu" aria-label="File">
					<button class="flex w-full items-center rounded px-2 py-1.5 text-left text-[11px] text-neutral-700 hover:bg-gray-100 hover:text-neutral-900" role="menuitem" onclick={() => { menuOpen = false; onopen?.(); }}>Open Project</button>
					<button class="flex w-full items-center rounded px-2 py-1.5 text-left text-[11px] text-neutral-700 hover:bg-gray-100 hover:text-neutral-900" role="menuitem" onclick={() => { menuOpen = false; onsave?.(); }}>Save Project</button>
				</div>
			{/if}
		</div>
		<span class="select-none pl-1 text-[13px] font-semibold tracking-tight text-neutral-900">Kairo</span>
		<input
			bind:value={projectName}
			class="w-36 rounded-md border border-transparent px-1.5 py-1 text-[12px] text-neutral-500 outline-none transition-colors hover:border-gray-200 focus:border-neutral-400 focus:text-neutral-900"
			aria-label="Project name"
			onchange={() => editor.setProjectName(projectName)}
		/>
	</div>
	<!-- Tools -->
	<div class="flex items-center gap-0.5">
		{#each tools as t}
			<button
				title="{t.label} ({t.key})"
				class="flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium transition-colors {editor.transformMode === t.id
					? 'bg-[var(--kairo-sapphire)] text-white shadow-sm'
					: 'text-neutral-600 hover:bg-gray-100 hover:text-neutral-900'}"
				onclick={() => editor.setTransform(editor.transformMode === t.id ? 'none' : t.id)}
			>
				{@render icon(t.id)}
				<span class="hidden xl:inline">{t.label}</span>
			</button>
		{/each}
	</div>

	<div class="flex-1"></div>

	<button
		class="ml-1.5 flex h-8 items-center gap-1.5 rounded-lg bg-[var(--kairo-sapphire)] px-4 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-[var(--kairo-sapphire-strong)]"
		onclick={() => onexport?.()}
	>
		<svg width="13" height="13" viewBox="0 0 15 15" fill="none">
			<path d="M7.5 1.5v8m0 0l3-3m-3 3l-3-3M2.5 10.5v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
		Export Image
	</button>
</header>

{#snippet icon(id: string)}
	{#if id === 'none'}
		<svg width="13" height="13" viewBox="0 0 15 15" fill="none">
			<path d="M4 1.5l9 3.2-3.9 1.3 2 3.4-1.5.9-2-3.5L4 11.5V1.5z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round" />
		</svg>
	{:else if id === 'translate'}
		<svg width="13" height="13" viewBox="0 0 15 15" fill="none">
			<path d="M7.5 1v13M1 7.5h13M7.5 3.5L5.8 5.2M7.5 3.5l1.7 1.7M7.5 11.5L5.8 9.8M7.5 11.5l1.7-1.7M11.5 7.5L9.8 5.8M11.5 7.5l-1.7 1.7M3.5 7.5L5.2 5.8M3.5 7.5l1.7 1.7" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	{:else if id === 'rotate'}
		<svg width="13" height="13" viewBox="0 0 15 15" fill="none">
			<path d="M13 7.5A5.5 5.5 0 1 1 10.1 3M13 1.5v2.7h-2.7M13 4.2V1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	{:else if id === 'scale'}
		<svg width="13" height="13" viewBox="0 0 15 15" fill="none">
			<path d="M13.5 8.5V13.5H8.5M1.5 6.5V1.5H6.5M13.5 1.5L8.5 6.5M1.5 13.5L6.5 8.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	{/if}
{/snippet}
