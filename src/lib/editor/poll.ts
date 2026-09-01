import { onMount } from 'svelte';

/**
 * Repeatedly read a value from an external (non-rune) object — e.g. a Three.js
 * camera or Object3D — and copy it into reactive state. Used once per
 * inspector instead of hand-rolled setInterval loops.
 */
export function poll<T>(
	read: () => T | null | undefined,
	assign: (value: T) => void,
	interval = 150,
) {
	onMount(() => {
		const id = setInterval(() => {
			const value = read();
			if (value != null) assign(value);
		}, interval);
		return () => clearInterval(id);
	});
}