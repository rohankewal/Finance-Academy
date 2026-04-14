<script lang="ts">
	import { TRACKS } from '$lib/data/tracks';

	let {
		completions,
	}: {
		completions: Array<{ track_slug: string; lesson_slug: string }>;
	} = $props();

	const accentStyles: Record<string, { bar: string; badge: string; icon: string }> = {
		emerald: { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'bg-emerald-100 text-emerald-600' },
		amber:   { bar: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200',     icon: 'bg-amber-100 text-amber-600' },
		blue:    { bar: 'bg-blue-500',     badge: 'bg-blue-50 text-blue-700 border-blue-200',        icon: 'bg-blue-100 text-blue-600' },
	};

	const iconPaths: Record<string, string> = {
		Wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
		CreditCard: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
		TrendingUp: 'M23 6l-9.5 9.5-5-5L1 18',
	};

	function getTrackData(track: typeof TRACKS[number]) {
		const done = track.lessons.filter((l) =>
			completions.some((c) => c.track_slug === track.slug && c.lesson_slug === l.slug),
		).length;
		const total = track.lessons.length;
		const pct = Math.round((done / total) * 100);
		const nextLesson = track.lessons.find(
			(l) => !completions.some((c) => c.track_slug === track.slug && c.lesson_slug === l.slug),
		);
		return { done, total, pct, nextLesson };
	}
</script>

<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
	{#each TRACKS as track}
		{@const style = accentStyles[track.accent] ?? accentStyles.emerald}
		{@const { done, total, pct, nextLesson } = getTrackData(track)}
		<div class="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col gap-4">
			<div class="flex items-start gap-3">
				<div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 {style.icon}">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d={iconPaths[track.icon]}></path>
					</svg>
				</div>
				<div class="flex-1 min-w-0">
					<p class="font-semibold text-zinc-900 text-sm">{track.title}</p>
					<p class="text-xs text-zinc-500 mt-0.5">{done} / {total} lessons</p>
				</div>
				{#if pct === 100}
					<span class="text-xs text-success font-semibold shrink-0">✓ Done</span>
				{:else}
					<span class="text-xs font-semibold text-zinc-400 shrink-0">{pct}%</span>
				{/if}
			</div>

			<div class="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
				<div class="h-full rounded-full {style.bar} transition-all duration-500" style="width: {pct}%"></div>
			</div>

			{#if nextLesson}
				<a
					href="/learn/{track.slug}/{nextLesson.slug}"
					class="flex items-center justify-between text-xs font-medium text-primary hover:text-primary-dark transition-colors"
				>
					<span class="truncate">{nextLesson.title}</span>
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 ml-1">
						<polyline points="9 18 15 12 9 6"></polyline>
					</svg>
				</a>
			{:else}
				<a
					href="/certificate/{track.slug}"
					class="flex items-center justify-between text-xs font-medium text-success hover:text-success/80 transition-colors"
				>
					<span>View certificate</span>
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0">
						<polyline points="9 18 15 12 9 6"></polyline>
					</svg>
				</a>
			{/if}
		</div>
	{/each}
</div>
