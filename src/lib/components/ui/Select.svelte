<script lang="ts">
	let {
		value = $bindable(''),
		options,
		label,
		id,
		class: className = '',
		onchange,
	}: {
		value?: string;
		options: { value: string; label: string }[];
		label?: string;
		id?: string;
		class?: string;
		onchange?: (value: string) => void;
	} = $props();

	const inputId = id ?? `select-${Math.random().toString(36).slice(2)}`;

	function handleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		value = target.value;
		onchange?.(value);
	}
</script>

<div class="flex flex-col gap-1 {className}">
	{#if label}
		<label for={inputId} class="text-sm font-medium text-zinc-700">{label}</label>
	{/if}
	<div class="relative">
		<select
			id={inputId}
			bind:value
			onchange={handleChange}
			class="w-full appearance-none rounded-lg border border-zinc-200 bg-white py-2 pl-3 pr-8 text-sm text-zinc-900 transition-colors
				focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
		>
			{#each options as opt}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</select>
		<!-- Chevron icon -->
		<div class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="6 9 12 15 18 9"></polyline>
			</svg>
		</div>
	</div>
</div>
