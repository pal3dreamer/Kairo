<script lang="ts">
	let {
		label,
		x,
		y,
		z,
		step = 0.01,
		onchange,
	}: {
		label: string;
		x: number;
		y: number;
		z: number;
		step?: number;
		onchange: (x: number, y: number, z: number) => void;
	} = $props();
</script>

<div>
	<span class="mb-1 block text-[12px] text-gray-500">{label}</span>
	<div class="flex gap-1.5">
		{#each [
			{ v: x, axis: 'X' },
			{ v: y, axis: 'Y' },
			{ v: z, axis: 'Z' },
		] as field, i}
			<div class="relative">
				<span class="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400">
					{field.axis}
				</span>
				<input
					type="number"
					step={step}
					value={field.v}
					oninput={(e) => {
						const n = +(e.currentTarget.value);
						if (Number.isNaN(n)) return;
						if (i === 0) onchange(n, y, z);
						else if (i === 1) onchange(x, n, z);
						else onchange(x, y, n);
					}}
					aria-label={`${label} ${field.axis}`}
					class="w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-7 pr-1.5 text-[12px] tabular-nums text-neutral-700 outline-none focus:border-neutral-400"
				/>
			</div>
		{/each}
	</div>
</div>
