<script lang="ts">
	// Temporary screen-recording harness. Do not commit.
	import { onDestroy, onMount } from 'svelte';
	import type { Object3D, PerspectiveCamera } from 'three';
	import { getEditorState } from '$lib/editor/state.svelte';
	import { defaultCamera } from '$lib/renderer/presets';
	import { defaultHdri } from '$lib/renderer/defaults';

	// @ts-expect-error - three subpath exports aren't typed
	type OrbitControlsType = import('three/examples/jsm/controls/OrbitControls').OrbitControls;

	let {
		stage,
		target,
		camera,
		orbitControls,
	}: {
		stage: HTMLDivElement | undefined;
		target: Object3D | undefined;
		camera: PerspectiveCamera | undefined;
		orbitControls: OrbitControlsType | undefined;
	} = $props();

	const editor = getEditorState();
	const ready = $derived(Boolean(stage && target && camera && orbitControls));

	let running = $state(false);
	let finished = $state(false);
	let countdown = $state<number | null>(null);
	let cursorVisible = $state(false);
	let cursor: HTMLDivElement | undefined = $state();
	let pulse: HTMLDivElement | undefined = $state();
	let controller: AbortController | undefined;
	let cursorX = 0;
	let cursorY = 0;
	let stageScale = 1;
	let stageX = 0;
	let stageY = 0;

	type Snapshot = {
		selection: typeof editor.selection;
		transformMode: typeof editor.transformMode;
		screenSrc: string;
		studio: typeof editor.studio;
		background: typeof editor.background;
		material: typeof editor.material;
		bodyColorId: typeof editor.bodyColorId;
		customColor: string;
		exposure: number;
		hdri: string;
		content: typeof editor.content;
		shadow: typeof editor.shadow;
		phone: {
			position: [number, number, number];
			rotation: [number, number, number];
			scale: [number, number, number];
		};
		camera: {
			position: [number, number, number];
			target: [number, number, number];
		};
	};

	let snapshot: Snapshot | undefined;

	function sleep(ms: number, signal?: AbortSignal): Promise<void> {
		return new Promise((resolve, reject) => {
			if (signal?.aborted) {
				reject(new DOMException('Aborted', 'AbortError'));
				return;
			}
			const timer = window.setTimeout(() => {
				signal?.removeEventListener('abort', abort);
				resolve();
			}, ms);
			const abort = () => {
				window.clearTimeout(timer);
				reject(new DOMException('Aborted', 'AbortError'));
			};
			signal?.addEventListener('abort', abort, { once: true });
		});
	}

	function easeOutQuart(value: number): number {
		return 1 - Math.pow(1 - value, 4);
	}

	function tween(
		duration: number,
		update: (progress: number) => void,
		signal: AbortSignal,
	): Promise<void> {
		return new Promise((resolve, reject) => {
			const started = performance.now();
			let frame = 0;
			const abort = () => {
				cancelAnimationFrame(frame);
				reject(new DOMException('Aborted', 'AbortError'));
			};
			const tick = (now: number) => {
				if (signal.aborted) return;
				const raw = Math.min(1, (now - started) / duration);
				update(easeOutQuart(raw));
				if (raw < 1) {
					frame = requestAnimationFrame(tick);
				} else {
					signal.removeEventListener('abort', abort);
					resolve();
				}
			};
			signal.addEventListener('abort', abort, { once: true });
			frame = requestAnimationFrame(tick);
		});
	}

	async function waitFor(selector: string, signal: AbortSignal): Promise<HTMLElement> {
		for (let attempt = 0; attempt < 50; attempt += 1) {
			const element = stage?.querySelector<HTMLElement>(selector);
			if (element) return element;
			await sleep(50, signal);
		}
		throw new Error(`Showcase target not found: ${selector}`);
	}

	function transformValue(x: number, y: number, scale: number): string {
		return `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
	}

	async function focus(
		showcaseId: string | null,
		scale: number,
		signal: AbortSignal,
		duration = 700,
	): Promise<void> {
		if (!stage || !stage.parentElement) return;

		let nextX = 0;
		let nextY = 0;
		if (showcaseId) {
			const element = await waitFor(`[data-showcase="${showcaseId}"]`, signal);
			const sectionToggle = element.querySelector<HTMLButtonElement>(':scope > [data-section-toggle]');
			if (sectionToggle?.getAttribute('aria-expanded') === 'false') {
				sectionToggle.click();
				await sleep(240, signal);
			}
			const scroller = element.closest<HTMLElement>('[data-showcase-scroll]');
			if (scroller && element !== scroller) {
				const elementRect = element.getBoundingClientRect();
				const scrollerRect = scroller.getBoundingClientRect();
				const offset = elementRect.top + elementRect.height / 2 - (scrollerRect.top + scrollerRect.height / 2);
				scroller.scrollTo({ top: scroller.scrollTop + offset / stageScale, behavior: 'smooth' });
				await sleep(450, signal);
			}

			const hostRect = stage.parentElement.getBoundingClientRect();
			const rect = element.getBoundingClientRect();
			const transformedCenterX = rect.left - hostRect.left + rect.width / 2;
			const transformedCenterY = rect.top - hostRect.top + rect.height / 2;
			const centerX = (transformedCenterX - stageX) / stageScale;
			const centerY = (transformedCenterY - stageY) / stageScale;
			nextX = hostRect.width / 2 - centerX * scale;
			nextY = hostRect.height / 2 - centerY * scale;
			nextX = Math.min(0, Math.max(hostRect.width - hostRect.width * scale, nextX));
			nextY = Math.min(0, Math.max(hostRect.height - hostRect.height * scale, nextY));
		}

		const animation = stage.animate(
			[
				{ transform: transformValue(stageX, stageY, stageScale) },
				{ transform: transformValue(nextX, nextY, scale) },
			],
			{
				duration,
				easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
				fill: 'forwards',
			},
		);
		const abort = () => animation.cancel();
		signal.addEventListener('abort', abort, { once: true });
		try {
			await animation.finished;
		} finally {
			signal.removeEventListener('abort', abort);
		}
		stageX = nextX;
		stageY = nextY;
		stageScale = scale;
		stage.style.transform = transformValue(stageX, stageY, stageScale);
		animation.cancel();
	}

	async function moveCursor(selector: string, signal: AbortSignal, duration = 450): Promise<HTMLElement> {
		const element = await waitFor(selector, signal);
		if (!cursor || !stage?.parentElement) return element;
		const hostRect = stage.parentElement.getBoundingClientRect();
		const rect = element.getBoundingClientRect();
		const nextX = rect.left - hostRect.left + rect.width / 2;
		const nextY = rect.top - hostRect.top + rect.height / 2;
		cursor.style.opacity = '1';
		const animation = cursor.animate(
			[
				{ transform: `translate3d(${cursorX}px, ${cursorY}px, 0)` },
				{ transform: `translate3d(${nextX}px, ${nextY}px, 0)` },
			],
			{ duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
		);
		const abort = () => animation.cancel();
		signal.addEventListener('abort', abort, { once: true });
		try {
			await animation.finished;
		} finally {
			signal.removeEventListener('abort', abort);
		}
		cursorX = nextX;
		cursorY = nextY;
		cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
		animation.cancel();
		return element;
	}

	function clickPulse(): void {
		if (!pulse) return;
		pulse.style.left = `${cursorX}px`;
		pulse.style.top = `${cursorY}px`;
		pulse.animate(
			[
				{ opacity: 0.75, transform: 'translate(-50%, -50%) scale(0.35)' },
				{ opacity: 0, transform: 'translate(-50%, -50%) scale(1.8)' },
			],
			{ duration: 420, easing: 'ease-out' },
		);
	}

	async function activate(selector: string, signal: AbortSignal): Promise<void> {
		const element = await moveCursor(selector, signal);
		clickPulse();
		element.click();
		await sleep(500, signal);
	}

	async function pointAt(selector: string, signal: AbortSignal): Promise<void> {
		await moveCursor(selector, signal);
		clickPulse();
		await sleep(500, signal);
	}

	function createShowcaseScreen(): string {
		const canvas = document.createElement('canvas');
		canvas.width = 1170;
		canvas.height = 2532;
		const context = canvas.getContext('2d');
		if (!context) return '';

		context.fillStyle = '#f1f3ef';
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = '#111714';
		context.fillRect(0, 0, canvas.width, 830);
		context.fillStyle = '#f8faf7';
		context.font = '600 42px system-ui';
		context.fillText('KAIRO', 86, 138);
		context.font = '700 104px system-ui';
		context.fillText('Move ideas', 86, 360);
		context.fillText('into focus.', 86, 475);
		context.fillStyle = '#9bc8aa';
		context.beginPath();
		context.arc(920, 675, 155, 0, Math.PI * 2);
		context.fill();

		context.fillStyle = '#ffffff';
		context.beginPath();
		context.roundRect(70, 720, 1030, 560, 50);
		context.fill();
		context.fillStyle = '#315f52';
		context.beginPath();
		context.roundRect(110, 770, 950, 250, 36);
		context.fill();
		context.fillStyle = '#e5f1e8';
		context.font = '600 34px system-ui';
		context.fillText('TODAY', 160, 850);
		context.font = '700 84px system-ui';
		context.fillText('12 focused tasks', 160, 955);

		context.fillStyle = '#181d1a';
		context.font = '700 56px system-ui';
		context.fillText('Your workspace', 86, 1450);
		const cards = [
			{ y: 1530, color: '#f3b392', title: 'Product story', detail: 'Ready for review' },
			{ y: 1815, color: '#d8d0f2', title: 'Launch film', detail: 'In progress' },
			{ y: 2100, color: '#9bc8aa', title: 'Final mockups', detail: 'Exported in 4K' },
		];
		for (const card of cards) {
			context.fillStyle = '#ffffff';
			context.beginPath();
			context.roundRect(70, card.y, 1030, 230, 42);
			context.fill();
			context.fillStyle = card.color;
			context.beginPath();
			context.roundRect(110, card.y + 45, 140, 140, 30);
			context.fill();
			context.fillStyle = '#181d1a';
			context.font = '650 48px system-ui';
			context.fillText(card.title, 300, card.y + 105);
			context.fillStyle = '#68706b';
			context.font = '400 34px system-ui';
			context.fillText(card.detail, 300, card.y + 165);
		}
		return canvas.toDataURL('image/png');
	}

	function captureSnapshot(): Snapshot | undefined {
		if (!target || !camera || !orbitControls) return undefined;
		return {
			selection: editor.selection,
			transformMode: editor.transformMode,
			screenSrc: editor.screenSrc,
			studio: editor.studio,
			background: { ...editor.background },
			material: editor.material,
			bodyColorId: editor.bodyColorId,
			customColor: editor.customColor,
			exposure: editor.exposure,
			hdri: editor.hdri,
			content: { ...editor.content },
			shadow: { ...editor.shadow },
			phone: {
				position: [target.position.x, target.position.y, target.position.z],
				rotation: [target.rotation.x, target.rotation.y, target.rotation.z],
				scale: [target.scale.x, target.scale.y, target.scale.z],
			},
			camera: {
				position: [camera.position.x, camera.position.y, camera.position.z],
				target: [orbitControls.target.x, orbitControls.target.y, orbitControls.target.z],
			},
		};
	}

	function restoreSnapshot(): void {
		if (!snapshot || !target || !camera || !orbitControls) return;
		editor.select(snapshot.selection);
		editor.setTransform(snapshot.transformMode);
		editor.setScreen(snapshot.screenSrc);
		editor.setStudio(snapshot.studio);
		editor.setBackground({ ...snapshot.background });
		editor.setMaterial(snapshot.material);
		editor.setBodyColor(snapshot.bodyColorId);
		editor.setCustomColor(snapshot.customColor);
		editor.setExposure(snapshot.exposure);
		editor.setHdri(snapshot.hdri);
		editor.setContent({ ...snapshot.content });
		editor.setShadow({ ...snapshot.shadow });
		target.position.set(...snapshot.phone.position);
		target.rotation.set(...snapshot.phone.rotation);
		target.scale.set(...snapshot.phone.scale);
		camera.position.set(...snapshot.camera.position);
		orbitControls.target.set(...snapshot.camera.target);
		orbitControls.update();
	}

	function resetShowcase(): void {
		if (!target || !camera || !orbitControls) return;
		stage?.querySelector<HTMLButtonElement>('[data-showcase="nav-scene"]')?.click();
		editor.select(null);
		editor.setTransform('none');
		editor.clearScreen();
		editor.setStudio('soft');
		editor.setBodyColor('silver');
		editor.setMaterial('metal');
		editor.setExposure(0.8);
		editor.setHdri(defaultHdri);
		editor.setBackground({ type: 'gradient', gradientTop: '#ececec', gradientBottom: '#f8f8f8', gradientAngle: 180, gradientSpread: 1 });
		editor.setContent({ fit: 'fit', scale: 1, rotation: 0, offsetX: 0, offsetY: 0, brightness: 1, contrast: 1, saturation: 1 });
		editor.setShadow({ opacity: 0.25, blur: 4, distance: 3 });
		target.position.set(0, -0.35, 0);
		target.rotation.set(0, 0.3, 0);
		target.scale.set(0.01, 0.01, 0.01);
		camera.position.set(...defaultCamera.position);
		orbitControls.target.set(0, 0, 0);
		orbitControls.update();
		const inspector = stage?.querySelector<HTMLElement>('[data-showcase-scroll="inspector"]');
		inspector?.scrollTo({ top: 0 });
	}

	async function animatePhoneRotation(y: number, duration: number, signal: AbortSignal): Promise<void> {
		if (!target) return;
		const start = target.rotation.y;
		await tween(duration, (progress) => {
			target.rotation.y = start + (y - start) * progress;
		}, signal);
	}

	async function animateCamera(
		position: [number, number, number],
		duration: number,
		signal: AbortSignal,
	): Promise<void> {
		if (!camera || !orbitControls) return;
		const start = camera.position.clone();
		const end = camera.position.clone().set(...position);
		await tween(duration, (progress) => {
			camera.position.lerpVectors(start, end, progress);
			orbitControls.target.set(0, 0, 0);
			orbitControls.update();
		}, signal);
	}

	async function runSequence(signal: AbortSignal): Promise<void> {
		resetShowcase();
		await focus(null, 1, signal, 350);
		await sleep(900, signal);

		await activate('[data-showcase="scene-phone"]', signal);
		await focus('appearance', 1.28, signal);
		await activate('[data-showcase="appearance"] [data-showcase-option="blue"]', signal);
		await animatePhoneRotation(-0.25, 900, signal);
		await activate('[data-showcase="nav-assets"]', signal);
		await focus('material', 1.28, signal);
		await activate('[data-showcase="material"] [data-showcase-option="glossy"]', signal);
		await sleep(700, signal);
		await activate('[data-showcase="appearance"] [data-showcase-option="titanium"]', signal);
		await animatePhoneRotation(0.5, 1000, signal);

		await activate('[data-showcase="nav-assets"]', signal);
		await focus('media-assets', 1.25, signal);
		await pointAt('[data-showcase="media-assets"] [data-showcase="media-picker"]', signal);
		editor.setScreen(createShowcaseScreen());
		await sleep(900, signal);
		await focus('screen', 1.25, signal);
		await activate('[data-showcase="screen"] [data-showcase-option="fill"]', signal);
		editor.setContent({ ...editor.content, scale: 1.1, offsetY: -0.04 });
		await pointAt('[data-showcase="screen"] [data-showcase-control="Brightness"]', signal);
		editor.setContent({ ...editor.content, brightness: 1.12, contrast: 1.08, saturation: 1.16 });
		await sleep(800, signal);

		await focus('shadow', 1.3, signal);
		await pointAt('[data-showcase="shadow"] [data-showcase-control="Opacity"]', signal);
		editor.setShadow({ opacity: 0.48, blur: 6.2, distance: 3.8 });
		await sleep(900, signal);

		await focus(null, 1, signal, 550);
		await activate('[data-showcase="scene-lights"]', signal);
		await focus('environment', 1.27, signal);
		await activate('[data-showcase="environment"] [data-showcase-option="ferndale"]', signal);
		editor.setExposure(1.05);
		await sleep(1800, signal);

		await focus(null, 1, signal, 550);
		await activate('[data-showcase="nav-scene"]', signal);
		await activate('[data-showcase="scene-background"]', signal);
		await focus('background-type', 1.27, signal);
		await activate('[data-showcase="background-type"] [data-showcase-option="gradient"]', signal);
		editor.setBackground({ type: 'gradient', gradientTop: '#263238', gradientBottom: '#e9f0eb', gradientAngle: 145, gradientSpread: 0.82 });
		await sleep(900, signal);
		editor.setBackground({ type: 'gradient', gradientTop: '#d9e7df', gradientBottom: '#f7f2ef', gradientAngle: 180, gradientSpread: 0.74 });
		await sleep(850, signal);

		await focus(null, 1, signal, 550);
		await activate('[data-showcase="nav-scene"]', signal);
		await activate('[data-showcase="scene-camera"]', signal);
		await focus('camera-presets', 1.24, signal);
		await pointAt('[data-showcase="camera-presets"] [data-showcase-option="camera-front"]', signal);
		await animateCamera([0, 0, 7.2], 1100, signal);
		await pointAt('[data-showcase="camera-presets"] [data-showcase-option="camera-perspective"]', signal);
		await animateCamera([5.2, 3.2, 5.4], 1300, signal);

		await focus(null, 1, signal, 600);
		editor.select(null);
		cursorVisible = false;
		await Promise.all([
			animateCamera([2.4, 1.45, 3.25], 1500, signal),
			animatePhoneRotation(0.72, 1500, signal),
		]);
		await sleep(900, signal);

		cursorVisible = true;
		await focus('export', 1.18, signal);
		await activate('[data-showcase="export"]', signal);
		await focus('export-modal', 1.08, signal);
		await activate('[data-showcase-option="4k-uhd"]', signal);
		await pointAt('[data-showcase="export-download"]', signal);
		await sleep(850, signal);
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		await sleep(450, signal);

		cursorVisible = false;
		await focus(null, 1, signal, 650);
		editor.select(null);
		await Promise.all([
			animateCamera([2.1, 1.25, 3.05], 1800, signal),
			animatePhoneRotation(0.38, 1800, signal),
		]);
		await sleep(2600, signal);
	}

	async function start(): Promise<void> {
		if (!ready || running) return;
		snapshot = captureSnapshot();
		controller = new AbortController();
		running = true;
		finished = false;
		cursorVisible = false;
		for (let value = 3; value >= 1; value -= 1) {
			countdown = value;
			await sleep(700, controller.signal);
		}
		countdown = null;
		cursorVisible = true;
		try {
			await runSequence(controller.signal);
			finished = true;
		} catch (error) {
			if (!(error instanceof DOMException && error.name === 'AbortError')) {
				console.error(error);
			}
		} finally {
			countdown = null;
			cursorVisible = false;
			running = false;
			controller = undefined;
		}
	}

	function stop(restore = true): void {
		controller?.abort();
		controller = undefined;
		running = false;
		countdown = null;
		cursorVisible = false;
		if (stage) {
			stageScale = 1;
			stageX = 0;
			stageY = 0;
			stage.style.transform = transformValue(0, 0, 1);
		}
		if (restore) restoreSnapshot();
	}

	onMount(() => {
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && running) stop();
		};
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	onDestroy(() => stop(false));
</script>

<div class="pointer-events-none absolute inset-0 z-[100] overflow-hidden">
	{#if countdown !== null}
		<div class="absolute inset-0 flex items-center justify-center bg-black/15 backdrop-blur-[1px]">
			<div class="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-950/90 text-4xl font-semibold text-white shadow-2xl">
				{countdown}
			</div>
		</div>
	{/if}

	<div
		bind:this={pulse}
		class="absolute h-8 w-8 rounded-full border-2 border-[var(--kairo-sapphire)] opacity-0"
	></div>

	<div
		bind:this={cursor}
		class="absolute left-0 top-0 transition-opacity duration-200 {cursorVisible ? 'opacity-100' : 'opacity-0'}"
		style="transform: translate3d(0, 0, 0)"
	>
		<svg width="24" height="30" viewBox="0 0 24 30" fill="none" aria-hidden="true" class="drop-shadow-md">
			<path d="M2 2.5v21.2l5.2-5.1 4.1 8.9 4-1.9-4.1-8.7h7.3L2 2.5Z" fill="white" stroke="#111" stroke-width="1.5" stroke-linejoin="round" />
		</svg>
	</div>

	{#if !running}
		<div class="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2">
			<button
				type="button"
				disabled={!ready}
				class="flex h-11 items-center gap-2 rounded-md bg-neutral-950 px-5 text-[13px] font-semibold text-white shadow-2xl transition-colors hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-50"
				onclick={start}
			>
				<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
					<path d="M4 2.5 12 7.5 4 12.5V2.5Z" fill="currentColor" />
				</svg>
				{ready ? (finished ? 'Replay showcase' : 'Start showcase') : 'Preparing scene...'}
			</button>
		</div>
	{:else if countdown === null}
		<button
			type="button"
			class="pointer-events-auto absolute right-4 top-4 rounded-md bg-neutral-950/75 px-3 py-2 text-[12px] font-medium text-white backdrop-blur hover:bg-neutral-950"
			onclick={() => stop()}
		>
			Stop
		</button>
	{/if}
</div>
