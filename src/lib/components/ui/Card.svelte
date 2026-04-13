<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		padding = true,
		hover = false,
		children,
	}: {
		class?: string;
		padding?: boolean;
		hover?: boolean;
		children?: Snippet;
	} = $props();
</script>

<div
	class="bg-white rounded-xl border border-zinc-200 shadow-sm {hover ? 'card-hover cursor-pointer' : ''} {padding ? 'p-5' : ''} {className}"
>
	{@render children?.()}
</div>
