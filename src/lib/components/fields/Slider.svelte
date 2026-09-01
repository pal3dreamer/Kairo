<script lang="ts">
	let {
		label,
		value,
		min,
		max,
		step = 0.01,
		onchange,
		format,
	}: {
		label: string;
		value: number;
		min: number;
		max: number;
		step?: number;
		onchange: (v: number) => void;
		format?: (v: number) => string;
	} = $props();

	function onChange(e: Event) {
		const v = +((e.currentTarget as HTMLInputElement).value);
		onchange(Number.isNaN(v) ? value : v);
	}
</script>

<div class="min-w-0 space-y-2 py-0.5">
	<div class="flex min-w-0 items-center justify-between gap-3">
		<span class="min-w-0 text-[12px] font-medium text-gray-600">{label}</span>
		<span class="shrink-0 text-[12px] tabular-nums text-gray-500">
			{format ? format(value) : value}
		</span>
	</div>
	<input
		type="range"
		{min}
		{max}
		{step}
		value={value}
		oninput={onChange}
		class="block h-1.5 w-full min-w-0 cursor-pointer appearance-none rounded-full bg-gray-200 accent-[var(--kairo-sapphire)]"
	/>
</div>
