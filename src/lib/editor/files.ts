export function readFileAsDataUrl(file: File, onload: (dataUrl: string) => void) {
	const reader = new FileReader();
	reader.onload = () => onload(reader.result as string);
	reader.readAsDataURL(file);
}