import {
	Color,
	Vector2,
	Vector4,
	WebGLRenderTarget,
	type PerspectiveCamera,
	type Scene,
	type WebGLRenderer,
} from 'three';

export type ExportFormat = 'png' | 'jpeg' | 'webp';

export type ExportSettings = {
	width: number;
	height: number;
	format: ExportFormat;
	quality: number;
	transparent: boolean;
};

export type ViewportSize = {
	width: number;
	height: number;
};

export type ExportPresetId = 'viewport-1x' | 'viewport-2x' | '4k-uhd';

export const EXPORT_MAX_DIMENSION = 8192;
export const EXPORT_MAX_PIXELS = 64_000_000;

export const exportPresets: {
	id: ExportPresetId;
	label: string;
	description: string;
}[] = [
	{ id: 'viewport-1x', label: 'Viewport 1x', description: 'Current editor size' },
	{ id: 'viewport-2x', label: 'Viewport 2x', description: 'Double the editor size' },
	{ id: '4k-uhd', label: '4K UHD', description: '3840 x 2160' },
];

export const exportFormats: { id: ExportFormat; label: string; extension: string }[] = [
	{ id: 'png', label: 'PNG', extension: 'png' },
	{ id: 'jpeg', label: 'JPEG', extension: 'jpg' },
	{ id: 'webp', label: 'WebP', extension: 'webp' },
];

export function dimensionsForPreset(preset: ExportPresetId, viewport: ViewportSize): ViewportSize {
	if (preset === '4k-uhd') return { width: 3840, height: 2160 };

	const scale = preset === 'viewport-2x' ? 2 : 1;
	return {
		width: Math.max(1, Math.round(viewport.width * scale)),
		height: Math.max(1, Math.round(viewport.height * scale)),
	};
}

export function supportsTransparency(format: ExportFormat): boolean {
	return format !== 'jpeg';
}

export function mimeTypeFor(format: ExportFormat): string {
	if (format === 'jpeg') return 'image/jpeg';
	if (format === 'webp') return 'image/webp';
	return 'image/png';
}

export function extensionFor(format: ExportFormat): string {
	return exportFormats.find((item) => item.id === format)?.extension ?? 'png';
}

export function normalizeExportSettings(settings: ExportSettings): ExportSettings {
	return {
		width: Math.round(settings.width),
		height: Math.round(settings.height),
		format: settings.format,
		quality: Math.min(1, Math.max(0.1, settings.quality)),
		transparent: supportsTransparency(settings.format) && settings.transparent,
	};
}

export function validateExportDimensions(
	width: number,
	height: number,
	maxTextureSize = EXPORT_MAX_DIMENSION,
): ViewportSize {
	const normalizedWidth = Math.round(width);
	const normalizedHeight = Math.round(height);
	const maxDimension = Math.min(EXPORT_MAX_DIMENSION, maxTextureSize);

	if (
		!Number.isSafeInteger(normalizedWidth) ||
		!Number.isSafeInteger(normalizedHeight) ||
		normalizedWidth < 1 ||
		normalizedHeight < 1
	) {
		throw new Error('Export dimensions must be positive whole numbers.');
	}
	if (normalizedWidth > maxDimension || normalizedHeight > maxDimension) {
		throw new Error(`Export dimensions cannot exceed ${maxDimension} x ${maxDimension} on this device.`);
	}
	if (normalizedWidth * normalizedHeight > EXPORT_MAX_PIXELS) {
		throw new Error('That export is too large for a browser image. Choose a smaller size.');
	}

	return { width: normalizedWidth, height: normalizedHeight };
}

function pixelsToBlob(
	pixels: Uint8Array,
	width: number,
	height: number,
	format: ExportFormat,
	quality: number,
): Promise<Blob> {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	const context = canvas.getContext('2d');
	if (!context) throw new Error('The browser could not create an export canvas.');

	const imageData = context.createImageData(width, height);
	const rowBytes = width * 4;
	for (let y = 0; y < height; y += 1) {
		const sourceStart = (height - y - 1) * rowBytes;
		imageData.data.set(pixels.subarray(sourceStart, sourceStart + rowBytes), y * rowBytes);
	}
	context.putImageData(imageData, 0, 0);

	// JPEG has no alpha channel. Composite transparent pixels over white.
	if (format === 'jpeg') {
		context.globalCompositeOperation = 'destination-over';
		context.fillStyle = '#ffffff';
		context.fillRect(0, 0, width, height);
		context.globalCompositeOperation = 'source-over';
	}

	const mimeType = mimeTypeFor(format);
	const cleanup = () => {
		canvas.width = 1;
		canvas.height = 1;
	};
	return new Promise<Blob>((resolve, reject) => {
		try {
			context.canvas.toBlob(
				(blob) => {
					cleanup();
					if (!blob) {
						reject(new Error(`The browser could not encode a ${format.toUpperCase()} export.`));
						return;
					}
					if (format !== 'png' && blob.type !== mimeType) {
						reject(new Error(`${format.toUpperCase()} export is not supported by this browser.`));
						return;
					}
					resolve(blob);
				},
				mimeType,
				format === 'png' ? undefined : quality,
			);
		} catch (error) {
			cleanup();
			reject(error);
		}
	});
}

export async function captureSceneToBlob(
	renderer: WebGLRenderer,
	scene: Scene,
	sourceCamera: PerspectiveCamera,
	settings: ExportSettings,
): Promise<Blob> {
	const normalized = normalizeExportSettings(settings);
	const dimensions = validateExportDimensions(
		normalized.width,
		normalized.height,
		renderer.capabilities.maxTextureSize,
	);

	const samples = renderer.capabilities.isWebGL2 ? 4 : 0;
	const target = new WebGLRenderTarget(dimensions.width, dimensions.height, {
		depthBuffer: true,
		stencilBuffer: false,
		samples,
	});
	target.texture.colorSpace = renderer.outputColorSpace;

	const exportCamera = sourceCamera.clone();
	exportCamera.aspect = dimensions.width / dimensions.height;
	exportCamera.updateProjectionMatrix();

	const previousTarget = renderer.getRenderTarget();
	const previousViewport = renderer.getViewport(new Vector4());
	const previousScissor = renderer.getScissor(new Vector4());
	const previousScissorTest = renderer.getScissorTest();
	const previousClearColor = renderer.getClearColor(new Color());
	const previousClearAlpha = renderer.getClearAlpha();
	const previousAutoClear = renderer.autoClear;
	const previousAutoClearColor = renderer.autoClearColor;
	const previousAutoClearDepth = renderer.autoClearDepth;
	const previousAutoClearStencil = renderer.autoClearStencil;
	const previousBackground = scene.background;
	let pixels: Uint8Array | undefined;

	try {
		renderer.autoClear = true;
		renderer.autoClearColor = true;
		renderer.autoClearDepth = true;
		renderer.autoClearStencil = true;

		if (normalized.transparent) {
			scene.background = null;
			renderer.setClearColor(0x000000, 0);
		} else {
			renderer.setClearAlpha(1);
		}

		renderer.setRenderTarget(target);
		renderer.render(scene, exportCamera);

		pixels = new Uint8Array(dimensions.width * dimensions.height * 4);
		await renderer.readRenderTargetPixelsAsync(
			target,
			0,
			0,
			dimensions.width,
			dimensions.height,
			pixels,
		);
	} finally {
		renderer.setRenderTarget(previousTarget);
		if (previousTarget === null) {
			renderer.setViewport(previousViewport);
			renderer.setScissor(previousScissor);
			renderer.setScissorTest(previousScissorTest);
		}
		renderer.setClearColor(previousClearColor, previousClearAlpha);
		renderer.autoClear = previousAutoClear;
		renderer.autoClearColor = previousAutoClearColor;
		renderer.autoClearDepth = previousAutoClearDepth;
		renderer.autoClearStencil = previousAutoClearStencil;
		scene.background = previousBackground;
		target.dispose();
	}

	if (!pixels) throw new Error('The renderer returned no export pixels.');
	return pixelsToBlob(pixels, dimensions.width, dimensions.height, normalized.format, normalized.quality);
}

export function exportFileName(name: string, format: ExportFormat): string {
	const cleanName = name.trim().replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'kairo';
	return `${cleanName}.${extensionFor(format)}`;
}

export function viewportSize(renderer: WebGLRenderer): ViewportSize {
	const size = renderer.getSize(new Vector2());
	return {
		width: Math.max(1, Math.round(size.x)),
		height: Math.max(1, Math.round(size.y)),
	};
}
