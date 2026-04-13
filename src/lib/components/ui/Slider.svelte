<script lang="ts">
	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		label,
		showValue = true,
		formatValue,
		class: className = '',
		oninput,
	}: {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		label?: string;
		showValue?: boolean;
		formatValue?: (v: number) => string;
		class?: string;
		oninput?: (v: number) => void;
	} = $props();

	const displayValue = $derived(formatValue ? formatValue(value) : String(value));
	const percent = $derived(((value - min) / (max - min)) * 100);
	const sliderId = `slider-${Math.random().toString(36).slice(2)}`;
</script>

<div class="flex flex-col gap-2 {className}">
	{#if label || showValue}
		<div class="flex items-center justify-between">
			{#if label}
				<label for={sliderId} class="text-sm font-medium text-zinc-700">{label}</label>
			{/if}
			{#if showValue}
				<span class="text-sm font-mono font-medium text-primary tabular-nums">{displayValue}</span>
			{/if}
		</div>
	{/if}

	<div class="relative flex items-center h-5">
		<div class="absolute w-full h-1.5 rounded-full bg-zinc-200"></div>
		<div class="absolute h-1.5 rounded-full bg-primary transition-all" style="width: {percent}%"></div>
		<input
			id={sliderId}
			type="range"
			bind:value
			{min}
			{max}
			{step}
			aria-label={label}
			oninput={() => oninput?.(value)}
			class="relative w-full h-1.5 appearance-none bg-transparent cursor-pointer
				[&::-webkit-slider-thumb]:appearance-none
				[&::-webkit-slider-thumb]:w-4
				[&::-webkit-slider-thumb]:h-4
				[&::-webkit-slider-thumb]:rounded-full
				[&::-webkit-slider-thumb]:bg-primary
				[&::-webkit-slider-thumb]:shadow-sm
				[&::-webkit-slider-thumb]:border-2
				[&::-webkit-slider-thumb]:border-white
				[&::-webkit-slider-thumb]:transition-transform
				[&::-webkit-slider-thumb]:hover:scale-110
				[&::-moz-range-thumb]:w-4
				[&::-moz-range-thumb]:h-4
				[&::-moz-range-thumb]:rounded-full
				[&::-moz-range-thumb]:bg-primary
				[&::-moz-range-thumb]:border-2
				[&::-moz-range-thumb]:border-white"
		/>
	</div>
</div>
