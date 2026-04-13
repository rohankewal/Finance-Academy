<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		explainer,
		inputs,
		outputs,
		chart,
	}: {
		title: string;
		description?: string;
		explainer?: string;
		inputs: Snippet;
		outputs: Snippet;
		chart?: Snippet;
	} = $props();
</script>

<div class="w-full">
	{#if title || description}
		<div class="mb-6">
			{#if title}
				<h1 class="text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
			{/if}
			{#if description}
				<p class="mt-1 text-sm text-zinc-500">{description}</p>
			{/if}
		</div>
	{/if}

	<!-- Main calculator area: inputs | outputs -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
		<!-- Inputs card -->
		<div class="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 flex flex-col gap-5">
			{@render inputs()}
		</div>

		<!-- Outputs + chart card -->
		<div class="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 flex flex-col gap-5">
			{@render outputs()}
			{#if chart}
				<div class="border-t border-zinc-100 pt-4">
					{@render chart()}
				</div>
			{/if}
		</div>
	</div>

	<!-- Explainer section -->
	{#if explainer}
		<div class="mt-6 bg-zinc-50 rounded-xl border border-zinc-200 p-5">
			<h3 class="text-sm font-semibold text-zinc-700 mb-2 flex items-center gap-2">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="16" x2="12" y2="12"></line>
					<line x1="12" y1="8" x2="12.01" y2="8"></line>
				</svg>
				What this teaches you
			</h3>
			<p class="text-sm text-zinc-600 leading-relaxed">{explainer}</p>
		</div>
	{/if}
</div>
