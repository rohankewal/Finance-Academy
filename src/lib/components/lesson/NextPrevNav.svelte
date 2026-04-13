<script lang="ts">
	import type { Lesson } from '$lib/data/tracks';

	let {
		prev,
		next,
	}: {
		prev: (Lesson & { trackSlug: string }) | null;
		next: (Lesson & { trackSlug: string }) | null;
	} = $props();
</script>

<nav class="mt-10 pt-6 border-t border-zinc-200 flex items-stretch gap-3 not-prose">
	{#if prev}
		<a
			href="/learn/{prev.trackSlug}/{prev.slug}"
			class="flex-1 flex flex-col gap-1 px-4 py-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all group"
		>
			<div class="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
				Previous lesson
			</div>
			<span class="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors line-clamp-2">
				{prev.title}
			</span>
		</a>
	{:else}
		<div class="flex-1"></div>
	{/if}

	{#if next}
		<a
			href="/learn/{next.trackSlug}/{next.slug}"
			class="flex-1 flex flex-col gap-1 px-4 py-3 rounded-xl border border-zinc-200 bg-white hover:border-primary/30 hover:shadow-sm transition-all group text-right"
		>
			<div class="flex items-center justify-end gap-1.5 text-xs text-zinc-400 font-medium">
				Next lesson
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</div>
			<span class="text-sm font-medium text-zinc-700 group-hover:text-primary transition-colors line-clamp-2">
				{next.title}
			</span>
		</a>
	{:else}
		<div class="flex-1 flex flex-col gap-1 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-right">
			<span class="text-xs text-emerald-600 font-medium">Track complete!</span>
			<a href="/learn" class="text-sm font-medium text-emerald-700 hover:text-emerald-900 transition-colors">
				Browse more tracks →
			</a>
		</div>
	{/if}
</nav>
