<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title = 'Try It Yourself',
		children,
	}: {
		title?: string;
		children?: Snippet;
	} = $props();

	let expanded = $state(true);
</script>

<div class="not-prose my-8 rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden shadow-sm">
	<button
		type="button"
		onclick={() => (expanded = !expanded)}
		class="w-full flex items-center justify-between gap-3 px-5 py-3.5 bg-white border-b border-zinc-200 hover:bg-zinc-50 transition-colors text-left"
	>
		<div class="flex items-center gap-2.5">
			<div class="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-primary))" stroke-width="2.5">
					<polygon points="5 3 19 12 5 21 5 3"></polygon>
				</svg>
			</div>
			<span class="font-semibold text-sm text-zinc-800">{title}</span>
		</div>
		<svg
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			class="text-zinc-400 transition-transform {expanded ? 'rotate-180' : ''}"
		>
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>
	</button>

	{#if expanded}
		<div class="p-5">
			{@render children?.()}
		</div>
	{/if}
</div>
