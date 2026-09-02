<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Download,
		FolderOpen,
		Menu,
		MousePointer2,
		Move3d,
		PanelLeft,
		PanelRight,
		Rotate3d,
		Save,
		Scaling,
	} from '@lucide/svelte';
	import { getEditorState, type TransformMode } from '$lib/editor/state.svelte';

	let {
		onexport,
		onsave,
		onopen,
		onnavigator,
		oninspector,
		panelOpen,
		inspectorOpen,
	}: {
		onexport?: () => void;
		onsave?: () => void;
		onopen?: () => void;
		onnavigator: () => void;
		oninspector: () => void;
		panelOpen: boolean;
		inspectorOpen: boolean;
	} = $props();

	const editor = getEditorState();

	let projectName = $state(editor.projectName);
	let editingProjectName = $state(false);
	let menuOpen = $state(false);
	let menuRoot: HTMLDivElement | undefined = $state();

	const tools = [
		{ id: 'none' as const, label: 'Select', key: 'V', icon: MousePointer2 },
		{ id: 'translate' as const, label: 'Move', key: 'W', icon: Move3d },
		{ id: 'rotate' as const, label: 'Rotate', key: 'E', icon: Rotate3d },
		{ id: 'scale' as const, label: 'Scale', key: 'R', icon: Scaling },
	];

	function chooseTool(mode: TransformMode) {
		editor.setTransform(mode);
	}

	function handleKeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement;
		const key = event.key.toLowerCase();
		const modifier = event.ctrlKey || event.metaKey;
		if (modifier && key === 's') {
			event.preventDefault();
			menuOpen = false;
			onsave?.();
			return;
		}
		if (modifier && key === 'o') {
			event.preventDefault();
			menuOpen = false;
			onopen?.();
			return;
		}
		if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;
		if (key === 'v') chooseTool('none');
		else if (key === 'w') chooseTool('translate');
		else if (key === 'e') chooseTool('rotate');
		else if (key === 'r') chooseTool('scale');
		else if (key === 'escape') {
			menuOpen = false;
			chooseTool('none');
		}
	}

	function closeMenuOnOutsideClick(event: PointerEvent) {
		if (menuRoot && !menuRoot.contains(event.target as Node)) menuOpen = false;
	}

	function commitProjectName() {
		editor.setProjectName(projectName);
		projectName = editor.projectName;
		editingProjectName = false;
	}

	$effect(() => {
		if (!editingProjectName) projectName = editor.projectName;
	});

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('pointerdown', closeMenuOnOutsideClick);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.removeEventListener('pointerdown', closeMenuOnOutsideClick);
		};
	});
</script>

<header data-showcase="topbar" class="topbar">
	<div class="file-cluster" bind:this={menuRoot}>
		<div class="menu-anchor">
			<button
				type="button"
				class="k-icon-button"
				title="File menu"
				aria-label="File menu"
				aria-haspopup="menu"
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
			>
				<Menu size={16} strokeWidth={1.7} />
			</button>
			{#if menuOpen}
				<div class="file-menu" role="menu" aria-label="File">
					<button
						type="button"
						role="menuitem"
						onclick={() => {
							menuOpen = false;
							onopen?.();
						}}
					>
						<FolderOpen size={14} strokeWidth={1.7} />
						<span>Open project</span>
						<kbd>Ctrl O</kbd>
					</button>
					<button
						type="button"
						role="menuitem"
						onclick={() => {
							menuOpen = false;
							onsave?.();
						}}
					>
						<Save size={14} strokeWidth={1.7} />
						<span>Save project</span>
						<kbd>Ctrl S</kbd>
					</button>
				</div>
			{/if}
		</div>

		<span class="wordmark">Kairo</span>
		<span class="cluster-divider"></span>
		<input
			bind:value={projectName}
			class="project-name"
			aria-label="Project name"
			onfocus={() => (editingProjectName = true)}
			onblur={commitProjectName}
			onkeydown={(event) => {
				if (event.key === 'Enter') (event.currentTarget as HTMLInputElement).blur();
			}}
		/>
	</div>

	<div class="toolbar" role="toolbar" aria-label="Transform tools">
		{#each tools as tool (tool.id)}
			{@const Icon = tool.icon}
			<button
				type="button"
				class:active={editor.transformMode === tool.id}
				class="tool-button"
				title={`${tool.label} (${tool.key})`}
				aria-label={tool.label}
				aria-pressed={editor.transformMode === tool.id}
				onclick={() => chooseTool(tool.id)}
			>
				<Icon size={14} strokeWidth={1.65} />
				<span>{tool.label}</span>
				<kbd>{tool.key}</kbd>
			</button>
		{/each}
	</div>

	<div class="topbar-spacer"></div>

	<div class="view-actions">
		<button
			type="button"
			class:active={panelOpen}
			class="k-icon-button panel-toggle"
			title={panelOpen ? 'Hide workspace panel' : 'Show workspace panel'}
			aria-label={panelOpen ? 'Hide workspace panel' : 'Show workspace panel'}
			onclick={onnavigator}
		>
			<PanelLeft size={15} strokeWidth={1.7} />
		</button>
		<button
			type="button"
			class:active={inspectorOpen}
			class="k-icon-button panel-toggle"
			title={inspectorOpen ? 'Hide properties' : 'Show properties'}
			aria-label={inspectorOpen ? 'Hide properties' : 'Show properties'}
			onclick={oninspector}
		>
			<PanelRight size={15} strokeWidth={1.7} />
		</button>

		<button data-showcase="export" type="button" class="export-button" onclick={() => onexport?.()}>
			<Download size={14} strokeWidth={1.8} />
			<span>Export</span>
		</button>
	</div>
</header>

<style>
	.topbar {
		pointer-events: auto;
		display: flex;
		height: 44px;
		min-height: 44px;
		align-items: center;
		gap: 10px;
		padding: 0 8px;
		border-bottom: 1px solid var(--kairo-divider);
		background: var(--kairo-panel);
	}

	.file-cluster,
	.view-actions,
	.toolbar {
		display: flex;
		align-items: center;
	}

	.file-cluster {
		min-width: 0;
		gap: 7px;
	}

	.menu-anchor {
		position: relative;
	}

	.wordmark {
		color: var(--kairo-ink);
		font-family: var(--font-display);
		font-size: 13px;
		font-weight: 600;
		line-height: 1;
	}

	.cluster-divider {
		height: 16px;
		width: 1px;
		margin: 0 2px;
		background: var(--kairo-divider);
	}

	.project-name {
		width: 132px;
		height: 28px;
		min-width: 0;
		padding: 0 6px;
		border: 1px solid transparent;
		border-radius: 4px;
		background: transparent;
		color: var(--kairo-ink-muted);
		font-size: 11px;
		outline: none;
		text-overflow: ellipsis;
	}

	.project-name:hover {
		border-color: var(--kairo-divider-soft);
		background: var(--kairo-field);
	}

	.project-name:focus {
		border-color: var(--kairo-sapphire);
		background: var(--kairo-panel-raised);
		color: var(--kairo-ink);
	}

	.file-menu {
		position: absolute;
		z-index: 60;
		left: 0;
		top: 33px;
		display: grid;
		width: 188px;
		gap: 2px;
		padding: 4px;
		border: 1px solid var(--kairo-divider);
		border-radius: 5px;
		background: var(--kairo-panel-raised);
		box-shadow: 0 10px 28px oklch(0.25 0.018 242 / 0.16);
	}

	.file-menu button {
		display: grid;
		height: 30px;
		grid-template-columns: 18px minmax(0, 1fr) auto;
		align-items: center;
		gap: 6px;
		padding: 0 7px;
		border: 0;
		border-radius: var(--radius-control);
		background: transparent;
		color: var(--kairo-ink-secondary);
		font-size: 11px;
		text-align: left;
	}

	.file-menu button:hover {
		background: var(--kairo-field);
		color: var(--kairo-ink);
	}

	.file-menu kbd,
	.tool-button kbd {
		color: var(--kairo-ink-faint);
		font-family: var(--font-ui);
		font-size: 9px;
		font-weight: 500;
	}

	.toolbar {
		gap: 2px;
	}

	.tool-button {
		display: flex;
		height: 26px;
		align-items: center;
		gap: 5px;
		padding: 0 8px;
		border: 0;
		border-radius: 3px;
		background: transparent;
		color: var(--kairo-ink-muted);
		font-size: 11px;
		font-weight: 600;
		transition: background-color 140ms ease, color 140ms ease, box-shadow 140ms ease;
	}

	.tool-button:hover {
		background: color-mix(in oklch, var(--kairo-field) 70%, transparent);
		color: var(--kairo-ink);
	}

	.tool-button.active {
		background: var(--kairo-panel-raised);
		color: var(--kairo-ink);
		box-shadow: 0 0 0 1px var(--kairo-divider-soft), 0 1px 2px oklch(0.25 0.018 242 / 0.08);
	}

	.tool-button.active :global(svg) {
		color: var(--kairo-sapphire-strong);
	}

	.topbar-spacer {
		min-width: 4px;
		flex: 1;
	}

	.view-actions {
		gap: 3px;
	}

	.panel-toggle.active {
		background: var(--kairo-field);
		color: var(--kairo-ink);
	}

	.export-button {
		display: flex;
		height: 30px;
		align-items: center;
		gap: 6px;
		margin-left: 5px;
		padding: 0 11px;
		border: 1px solid color-mix(in oklch, var(--kairo-ink) 88%, transparent);
		border-radius: 4px;
		background: var(--kairo-ink);
		color: var(--kairo-panel-raised);
		font-size: 11px;
		font-weight: 600;
		transition: background-color 140ms ease, transform 80ms ease;
	}

	.export-button:hover {
		background: color-mix(in oklch, var(--kairo-ink) 88%, var(--kairo-sapphire));
	}

	.export-button:active {
		transform: translateY(1px);
	}

	@media (max-width: 1180px) {
		.tool-button span,
		.tool-button kbd {
			display: none;
		}

		.tool-button {
			width: 28px;
			justify-content: center;
			padding: 0;
		}
	}

	@media (max-width: 720px) {
		.topbar {
			gap: 5px;
			padding: 0 6px;
		}

		.cluster-divider,
		.project-name,
		.panel-toggle:first-of-type {
			display: none;
		}

		.file-cluster {
			gap: 5px;
		}
	}

	@media (max-width: 510px) {
		.wordmark,
		.export-button span {
			display: none;
		}

		.export-button {
			width: 30px;
			justify-content: center;
			padding: 0;
		}
	}
</style>
