<script lang="ts">
	import {
		Camera,
		ChevronRight,
		Image,
		Lightbulb,
		PanelLeftClose,
		Smartphone,
	} from '@lucide/svelte';
	import { getEditorState, type SceneObjectId, type ShadowConfig } from '$lib/editor/state.svelte';
	import type { EditorView } from '$lib/editor/ui';
	import { backgroundPresets, cameraPresets, finishOptions, hdriOptions } from '$lib/renderer/presets';
	import { studioPresetList } from '$lib/renderer/studioPresets';
	import { defaultHdri } from '$lib/renderer/defaults';
	import type { BackgroundConfig, MaterialPresetId, StudioPresetId } from '$lib/renderer/types';
	import { poll } from '$lib/editor/poll';
	import MediaPicker from './fields/MediaPicker.svelte';
	import PresetTile from './fields/PresetTile.svelte';

	let {
		view,
		camera,
		onpreset,
		onselect,
		onclose,
	}: {
		view: EditorView;
		camera: import('three').PerspectiveCamera | undefined;
		onpreset?: (pos: [number, number, number]) => void;
		onselect: (id: SceneObjectId) => void;
		onclose: () => void;
	} = $props();

	const editor = getEditorState();
	let cameraPosition = $state<[number, number, number]>([0, 0, 0]);
	let cameraFov = $state(24);
	const cameraPreviewAngles = [-2, -18, -42, 90, -28];

	const currentCameraPreset = $derived(
		cameraPresets.find((preset) =>
			preset.position.every((value, index) => Math.abs(value - cameraPosition[index]) < 0.08),
		)?.label,
	);

	const environmentPreview: Record<string, string> = {
		'studio-1k': 'linear-gradient(118deg, #252b31 0 22%, #d9dde0 22% 45%, #f1eee5 45% 68%, #606b73 68%)',
		'studio-4k': 'linear-gradient(118deg, #171c20 0 18%, #e8eaeb 18% 49%, #9ba5ac 49% 64%, #f2efe7 64%)',
		ferndale: 'linear-gradient(118deg, #342e27 0 20%, #aa9577 20% 43%, #d8c8ac 43% 66%, #53605b 66%)',
	};

	const materialPreview: Record<MaterialPresetId, string> = {
		matte: 'linear-gradient(135deg, #8c9298, #c5c8ca)',
		satin: 'linear-gradient(135deg, #737b82 0 35%, #b8bec2 50%, #697177 68%)',
		brushed: 'repeating-linear-gradient(100deg, #6f777d 0 2px, #aab0b4 2px 4px)',
		glossy: 'linear-gradient(135deg, #41484e 0 38%, #f0f1f0 48%, #596168 58%)',
		metal: 'linear-gradient(135deg, #3c4248 0 30%, #d9dcde 46%, #6d747a 64%, #e8e9e8 78%)',
	};

	const shadowPresets: { id: string; label: string; config: ShadowConfig }[] = [
		{ id: 'soft', label: 'Soft', config: { opacity: 0.25, blur: 4, distance: 3 } },
		{ id: 'crisp', label: 'Crisp', config: { opacity: 0.4, blur: 1.8, distance: 2.4 } },
		{ id: 'float', label: 'Float', config: { opacity: 0.18, blur: 7.5, distance: 5.2 } },
		{ id: 'none', label: 'None', config: { opacity: 0, blur: 0, distance: 0 } },
	];

	poll(
		() => camera
			? {
				position: [camera.position.x, camera.position.y, camera.position.z] as [number, number, number],
				fov: camera.fov,
			}
			: null,
		(value) => {
			cameraPosition = value.position;
			cameraFov = value.fov;
		},
	);

	function backgroundIsActive(config: BackgroundConfig): boolean {
		const current = editor.background;
		return (
			current.type === config.type &&
			current.solidColor === config.solidColor &&
			current.gradientTop === config.gradientTop &&
			current.gradientBottom === config.gradientBottom &&
			current.gradientAngle === config.gradientAngle &&
			current.gradientSpread === config.gradientSpread &&
			current.imageUrl === config.imageUrl
		);
	}

	function selectEnvironment(url: string) {
		editor.setHdri(url);
		onselect('lights');
	}

	function shadowIsActive(config: ShadowConfig): boolean {
		return (
			Math.abs(editor.shadow.opacity - config.opacity) < 0.01 &&
			Math.abs(editor.shadow.blur - config.blur) < 0.01 &&
			Math.abs(editor.shadow.distance - config.distance) < 0.01
		);
	}
</script>

<aside data-showcase="left-panel" class="context-panel">
	<header class="panel-header">
		<div class="panel-heading">
			<span class="panel-eyebrow">Workspace</span>
			<h2>{view === 'scene' ? 'Scene' : view === 'backgrounds' ? 'Backgrounds' : view === 'lighting' ? 'Lighting' : view === 'camera' ? 'Camera views' : 'Assets'}</h2>
		</div>
		<button type="button" class="k-icon-button" title="Collapse panel" aria-label="Collapse panel" onclick={onclose}>
			<PanelLeftClose size={15} strokeWidth={1.7} />
		</button>
	</header>

	<div data-showcase-scroll="left-panel" class="panel-scroll kairo-scrollbar">
		{#if view === 'scene'}
			<section class="tree-group">
				<h3>Devices</h3>
				<button
					type="button"
					data-showcase="scene-phone"
					class:active={editor.selection === 'phone'}
					class="tree-row"
					onclick={() => onselect('phone')}
				>
					<Smartphone size={16} strokeWidth={1.7} />
					<span class="tree-label">{editor.modelName}</span>
					<ChevronRight size={13} strokeWidth={1.6} class="tree-chevron" />
				</button>
			</section>

			<section class="tree-group environment-group">
				<h3>Environment</h3>
				<button
					type="button"
					data-showcase="scene-background"
					class:active={editor.selection === 'background'}
					class="tree-row"
					onclick={() => onselect('background')}
				>
					<Image size={16} strokeWidth={1.7} />
					<span class="tree-label">Background</span>
					<span class="tree-value">{editor.background.type}</span>
				</button>
				<button
					type="button"
					data-showcase="scene-lights"
					class:active={editor.selection === 'lights'}
					class="tree-row"
					onclick={() => onselect('lights')}
				>
					<Lightbulb size={16} strokeWidth={1.7} />
					<span class="tree-label">Lighting</span>
					<span class="tree-value">{studioPresetList.find((preset) => preset.id === editor.studio)?.label.replace(' Studio', '')}</span>
				</button>
				<button
					type="button"
					data-showcase="scene-camera"
					class:active={editor.selection === 'camera'}
					class="tree-row"
					onclick={() => onselect('camera')}
				>
					<Camera size={16} strokeWidth={1.7} />
					<span class="tree-label">Camera</span>
					<span class="tree-value">{Math.round(cameraFov)}°</span>
				</button>
			</section>
		{:else if view === 'backgrounds'}
			<section class="asset-section">
				<div class="section-heading">
					<h3>Presets</h3>
					<span>{backgroundPresets.length}</span>
				</div>
				<div class="preset-grid">
					{#each backgroundPresets as preset (preset.id)}
						<PresetTile
							label={preset.label}
							active={backgroundIsActive(preset.config)}
							preview={preset.swatch}
							showcaseOption={preset.id}
							onclick={() => {
								editor.setBackground(preset.config);
								onselect('background');
							}}
						/>
					{/each}
				</div>
			</section>

		{:else if view === 'lighting'}
			<section class="asset-section">
				<div class="section-heading">
					<h3>Studio presets</h3>
					<span>{studioPresetList.length}</span>
				</div>
				<div class="preset-grid">
					{#each studioPresetList as preset (preset.id)}
						<PresetTile
							label={preset.label.replace(' Studio', '')}
							active={editor.studio === preset.id}
							preview={`linear-gradient(140deg, ${preset.swatch}, color-mix(in srgb, ${preset.swatch} 34%, #30363c))`}
							showcaseOption={preset.id}
							onclick={() => {
								editor.setStudio(preset.id as StudioPresetId);
								onselect('lights');
							}}
						>
							<div class="studio-object" aria-hidden="true"></div>
						</PresetTile>
					{/each}
				</div>
			</section>

			<section data-showcase="environment" class="asset-section environment-assets">
				<div class="section-heading">
					<h3>Environments</h3>
					<span>HDR</span>
				</div>
				<div class="preset-grid">
					{#each hdriOptions as option (option.id)}
						<PresetTile
							label={option.label.replace('Studio ', 'Studio')}
							meta={option.id.includes('4k') ? '4K' : '1K'}
							active={editor.hdri === option.url || (editor.hdri === defaultHdri && option.id === 'studio-1k')}
							preview={environmentPreview[option.id]}
							showcaseOption={option.id}
							onclick={() => selectEnvironment(option.url)}
						>
							<span class="environment-horizon" aria-hidden="true"></span>
						</PresetTile>
					{/each}
				</div>
			</section>
		{:else if view === 'camera'}
			<section data-showcase="camera-presets" class="asset-section">
				<div class="section-heading">
					<h3>Views</h3>
					<span>{cameraPresets.length}</span>
				</div>
				<div class="preset-grid">
					{#each cameraPresets as preset, index (preset.label)}
						<PresetTile
							label={preset.label}
							active={currentCameraPreset === preset.label}
							showcaseOption={`camera-${preset.label.toLowerCase().replace(/[^a-z]+/g, '-')}`}
							onclick={() => onpreset?.(preset.position)}
						>
							<div class="camera-preview" style={`--preview-angle: ${cameraPreviewAngles[index]}deg`} aria-hidden="true">
								<span class="camera-device"></span>
								<span class="camera-axis"></span>
							</div>
						</PresetTile>
					{/each}
				</div>
			</section>
		{:else}
			<section class="asset-section">
				<div class="section-heading">
					<h3>Device</h3>
					<span>1</span>
				</div>
				<button type="button" class="device-asset active" onclick={() => onselect('phone')}>
					<span class="device-preview" aria-hidden="true"><Smartphone size={28} strokeWidth={1.25} /></span>
					<span class="device-copy">
						<strong>{editor.modelName}</strong>
						<small>Active model</small>
					</span>
					<span class="active-dot" aria-hidden="true"></span>
				</button>
			</section>

			<section data-showcase="media-assets" class="asset-section screen-asset">
				<div class="section-heading"><h3>Screen media</h3></div>
				{#if editor.screenSrc}
					<button type="button" class="screen-preview" onclick={() => onselect('phone')}>
						<img src={editor.screenSrc} alt="Current screen media" />
					</button>
				{:else}
					<div class="empty-media">
						<Smartphone size={19} strokeWidth={1.4} />
						<span>No screen media</span>
					</div>
				{/if}
				<MediaPicker
					accept="image/*"
					label={editor.screenSrc ? 'Replace media' : 'Add media'}
					onpick={(dataUrl) => {
						editor.setScreen(dataUrl);
						onselect('phone');
					}}
					onclear={editor.clearScreen}
					clearLabel="Remove"
					showClear={!!editor.screenSrc}
				/>
			</section>

			<section data-showcase="material" class="asset-section">
				<div class="section-heading">
					<h3>Materials</h3>
					<span>{finishOptions.length}</span>
				</div>
				<div class="preset-grid">
					{#each finishOptions as option (option.id)}
						<PresetTile
							label={option.label}
							active={editor.material === option.id}
							preview={materialPreview[option.id]}
							showcaseOption={option.id}
							onclick={() => editor.setMaterial(option.id)}
						/>
					{/each}
				</div>
			</section>

			<section class="asset-section">
				<div class="section-heading">
					<h3>Shadows</h3>
					<span>{shadowPresets.length}</span>
				</div>
				<div class="preset-grid">
					{#each shadowPresets as preset (preset.id)}
						<PresetTile
							label={preset.label}
							active={shadowIsActive(preset.config)}
							preview="linear-gradient(180deg, #e9ebed, #cfd3d6)"
							onclick={() => editor.setShadow({ ...preset.config })}
						>
							<span
								class="shadow-preview"
								style={`--shadow-opacity: ${preset.config.opacity}; --shadow-blur: ${preset.config.blur}px; --shadow-distance: ${Math.max(1, preset.config.distance * 1.5)}px`}
								aria-hidden="true"
							></span>
						</PresetTile>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</aside>

<style>
	.context-panel {
		pointer-events: auto;
		display: flex;
		width: 232px;
		min-width: 232px;
		height: 100%;
		flex-direction: column;
		overflow: hidden;
		border-right: 1px solid var(--kairo-divider);
		background: var(--kairo-panel);
	}

	.panel-header {
		display: flex;
		height: 54px;
		min-height: 54px;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 0 12px 0 14px;
	}

	.panel-heading {
		display: grid;
		gap: 3px;
		min-width: 0;
	}

	.panel-eyebrow,
	.tree-group h3,
	.section-heading h3 {
		margin: 0;
		color: var(--kairo-ink-muted);
		font-size: 10px;
		font-weight: 600;
		line-height: 1;
		text-transform: uppercase;
		letter-spacing: 0;
	}

	.panel-heading h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 13px;
		font-weight: 600;
		line-height: 1.15;
	}

	.panel-scroll {
		min-height: 0;
		flex: 1;
		overflow-x: hidden;
		overflow-y: auto;
		padding: 14px 10px 18px;
	}

	.tree-group {
		display: grid;
		gap: 4px;
	}

	.tree-group h3 {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 7px 6px;
	}

	.environment-group {
		margin-top: 20px;
	}

	.tree-row {
		display: grid;
		height: 34px;
		min-width: 0;
		grid-template-columns: 20px minmax(0, 1fr) auto;
		align-items: center;
		gap: 5px;
		padding: 0 7px;
		border: 1px solid transparent;
		border-radius: 4px;
		background: transparent;
		color: var(--kairo-ink-secondary);
		text-align: left;
		transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease;
	}

	.tree-row:hover {
		background: var(--kairo-field);
		color: var(--kairo-ink);
	}

	.tree-row.active {
		border-color: transparent;
		background: color-mix(in oklch, var(--kairo-field-hover) 78%, var(--kairo-sapphire-faint));
		color: var(--kairo-ink);
	}

	.tree-row.active :global(svg) {
		color: var(--kairo-sapphire-strong);
	}

	.tree-label {
		overflow: hidden;
		font-size: 12px;
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tree-value {
		max-width: 66px;
		overflow: hidden;
		color: var(--kairo-ink-faint);
		font-size: 10px;
		text-overflow: ellipsis;
		text-transform: capitalize;
		white-space: nowrap;
	}

	:global(.tree-chevron) {
		color: var(--kairo-ink-faint);
	}

	.asset-section + .asset-section {
		margin-top: 24px;
	}

	.section-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 0 4px 9px;
	}

	.section-heading span {
		color: var(--kairo-ink-faint);
		font-size: 9px;
		font-variant-numeric: tabular-nums;
	}

	.preset-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 6px;
	}

	.studio-object {
		height: 32px;
		width: 18px;
		border: 1px solid oklch(0.98 0.003 242 / 0.74);
		border-radius: 5px;
		background: oklch(0.34 0.018 242 / 0.72);
		box-shadow: -14px 2px 17px oklch(0.98 0.004 242 / 0.42), 14px 5px 18px oklch(0.18 0.018 242 / 0.25);
		transform: rotate(-8deg);
	}

	.environment-horizon {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 25%;
		height: 1px;
		background: oklch(0.96 0.006 242 / 0.6);
	}

	.camera-preview {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}

	.camera-device {
		height: 32px;
		width: 16px;
		border: 1px solid var(--kairo-ink-muted);
		border-radius: 4px;
		background: var(--kairo-panel-raised);
		transform: rotate(var(--preview-angle));
	}

	.camera-axis {
		position: absolute;
		left: 50%;
		bottom: 7px;
		height: 1px;
		width: 36px;
		transform: translateX(-50%);
		background: var(--kairo-divider);
	}

	.shadow-preview {
		display: block;
		height: 28px;
		width: 38px;
		border-radius: 4px;
		background: var(--kairo-panel-raised);
		box-shadow: 0 var(--shadow-distance) var(--shadow-blur) oklch(0.2 0.01 242 / var(--shadow-opacity));
	}

	.device-asset {
		display: grid;
		width: 100%;
		grid-template-columns: 48px minmax(0, 1fr) auto;
		align-items: center;
		gap: 10px;
		padding: 7px;
		border: 1px solid var(--kairo-divider-soft);
		border-radius: 5px;
		background: transparent;
		color: var(--kairo-ink-secondary);
		text-align: left;
	}

	.device-asset:hover {
		background: var(--kairo-field);
	}

	.device-preview {
		display: grid;
		height: 48px;
		place-items: center;
		border-radius: 4px;
		background: var(--kairo-field-hover);
		color: var(--kairo-ink-secondary);
	}

	.device-copy {
		display: grid;
		min-width: 0;
		gap: 2px;
	}

	.device-copy strong {
		overflow: hidden;
		font-size: 11px;
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.device-copy small {
		color: var(--kairo-ink-muted);
		font-size: 10px;
	}

	.active-dot {
		height: 6px;
		width: 6px;
		border-radius: 50%;
		background: var(--kairo-sapphire);
	}

	.screen-preview {
		display: block;
		width: 100%;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		margin-bottom: 8px;
		padding: 0;
		border: 1px solid var(--kairo-divider);
		border-radius: 5px;
		background: var(--kairo-field);
	}

	.screen-preview img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.empty-media {
		display: flex;
		height: 76px;
		align-items: center;
		justify-content: center;
		gap: 7px;
		margin-bottom: 8px;
		border: 1px dashed var(--kairo-divider);
		border-radius: 5px;
		color: var(--kairo-ink-faint);
		font-size: 11px;
	}

	@media (max-width: 1120px) {
		.context-panel {
		width: 236px;
			min-width: 236px;
		}
	}

	@media (max-width: 760px) {
		.context-panel {
			position: absolute;
			z-index: 30;
			left: 48px;
			top: 0;
			bottom: 0;
			width: min(232px, calc(100vw - 48px));
			min-width: 0;
			box-shadow: 12px 0 24px oklch(0.25 0.018 242 / 0.12);
		}
	}
</style>
