<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		tabs,
		activeTab = $bindable(0),
		children,
	}: {
		tabs: string[];
		activeTab?: number;
		children?: Snippet<[number]>;
	} = $props();
</script>

<div class="w-full">
	<!-- Tab list -->
	<div class="flex border-b border-zinc-200 gap-0.5">
		{#each tabs as tab, i}
			<button
				type="button"
				onclick={() => (activeTab = i)}
				class="px-4 py-2.5 text-sm font-medium rounded-t-md transition-colors
					{activeTab === i
					? 'text-primary border-b-2 border-primary -mb-px'
					: 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'}"
			>
				{tab}
			</button>
		{/each}
	</div>

	<!-- Tab content -->
	<div class="pt-4">
		{@render children?.(activeTab)}
	</div>
</div>
