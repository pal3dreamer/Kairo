<script lang="ts">
	let {
		label,
		value,
		oninput,
	}: {
		label: string;
		value: string;
		oninput: (c: string) => void;
	} = $props();
</script>

<div class="flex items-center gap-2.5">
	<span class="w-16 shrink-0 text-[12px] text-gray-500">{label}</span>
	<input
		type="color"
		value={value}
		oninput={(e) => oninput(e.currentTarget.value)}
		aria-label={label}
		class="h-7 w-9 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white p-0.5"
	/>
	<span class="text-[12px] tabular-nums text-gray-400">{value}</span>
</div>
