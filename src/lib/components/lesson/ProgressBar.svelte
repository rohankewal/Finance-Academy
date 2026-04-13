<script lang="ts">
	let {
		value,
		max = 100,
		label,
		class: className = '',
	}: {
		value: number;
		max?: number;
		label?: string;
		class?: string;
	} = $props();

	const pct = $derived(Math.min(100, Math.round((value / max) * 100)));
</script>

<div class="flex flex-col gap-1.5 {className}">
	{#if label}
		<div class="flex items-center justify-between">
			<span class="text-xs text-zinc-500">{label}</span>
			<span class="text-xs font-medium text-zinc-700">{pct}%</span>
		</div>
	{/if}
	<div class="h-1.5 rounded-full bg-zinc-200 overflow-hidden">
		<div
			class="h-full rounded-full bg-primary transition-all duration-500"
			style="width: {pct}%"
			role="progressbar"
			aria-valuenow={pct}
			aria-valuemin={0}
			aria-valuemax={100}
		></div>
	</div>
</div>
