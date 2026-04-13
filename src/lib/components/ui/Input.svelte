<script lang="ts">
	let {
		value = $bindable(''),
		type = 'text',
		label,
		id,
		min,
		max,
		step,
		prefix,
		suffix,
		error,
		placeholder,
		class: className = '',
		oninput,
	}: {
		value?: string | number;
		type?: string;
		label?: string;
		id?: string;
		min?: number | string;
		max?: number | string;
		step?: number | string;
		prefix?: string;
		suffix?: string;
		error?: string;
		placeholder?: string;
		class?: string;
		oninput?: (e: Event) => void;
	} = $props();

	const inputId = id ?? `input-${Math.random().toString(36).slice(2)}`;
</script>

<div class="flex flex-col gap-1 {className}">
	{#if label}
		<label for={inputId} class="text-sm font-medium text-zinc-700">{label}</label>
	{/if}
	<div class="relative flex items-center">
		{#if prefix}
			<span class="absolute left-3 text-sm text-zinc-500 pointer-events-none select-none">{prefix}</span>
		{/if}
		<input
			{type}
			id={inputId}
			bind:value
			{min}
			{max}
			{step}
			{placeholder}
			{oninput}
			class="w-full rounded-lg border {error ? 'border-danger' : 'border-zinc-200'} bg-white py-2 text-sm text-zinc-900 transition-colors
				focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
				{prefix ? 'pl-7' : 'pl-3'}
				{suffix ? 'pr-10' : 'pr-3'}"
		/>
		{#if suffix}
			<span class="absolute right-3 text-sm text-zinc-500 pointer-events-none select-none">{suffix}</span>
		{/if}
	</div>
	{#if error}
		<p class="text-xs text-danger">{error}</p>
	{/if}
</div>
