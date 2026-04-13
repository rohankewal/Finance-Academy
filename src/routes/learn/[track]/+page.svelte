<script lang="ts">
	import { page } from '$app/stores';
	import { getTrack } from '$lib/data/tracks';
	import { progress } from '$lib/stores/progress.svelte';
	import { error } from '@sveltejs/kit';

	const trackSlug = $derived($page.params.track);
	const track = $derived(getTrack(trackSlug));

	const pct = $derived(track ? progress.trackProgress(track.slug) : 0);

	const accentStyles: Record<string, { badge: string; bar: string }> = {
		emerald: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' },
		amber: { badge: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-500' },
		blue: { badge: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'bg-blue-500' },
	};
</script>

<svelte:head>
	{#if track}
		<title>{track.title} — Finance Academy</title>
		<meta name="description" content={track.description} />
	{/if}
</svelte:head>

{#if !track}
	<div class="max-w-2xl mx-auto px-4 py-16 text-center">
		<h1 class="text-2xl font-bold text-zinc-900 mb-2">Track not found</h1>
		<p class="text-zinc-500 mb-6">The track you're looking for doesn't exist.</p>
		<a href="/learn" class="text-primary hover:underline">Browse all tracks</a>
	</div>
{:else}
	{@const style = accentStyles[track.accent] ?? accentStyles.emerald}
	<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
		<!-- Header -->
		<nav class="text-sm text-zinc-500 mb-4">
			<a href="/learn" class="hover:text-zinc-700 transition-colors">Learn</a>
			<span class="mx-1.5">›</span>
			<span class="text-zinc-700">{track.title}</span>
		</nav>

		<header class="mb-8">
			<span class="inline-block text-xs font-semibold px-2.5 py-1 rounded-full border {style.badge} mb-3">
				{track.lessons.length} lessons
			</span>
			<h1 class="text-3xl font-bold tracking-tight text-zinc-900 mb-2">{track.title}</h1>
			<p class="text-zinc-500 text-base leading-relaxed">{track.description}</p>

			{#if pct > 0}
				<div class="mt-4 flex items-center gap-3">
					<div class="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
						<div class="h-full rounded-full {style.bar} transition-all" style="width: {pct}%"></div>
					</div>
					<span class="text-sm font-medium text-zinc-600">{pct}% complete</span>
				</div>
			{/if}
		</header>

		<!-- Lessons list -->
		<div class="flex flex-col gap-2">
			{#each track.lessons as lesson, i}
				{@const done = progress.isComplete(track.slug, lesson.slug)}
				<a
					href="/learn/{track.slug}/{lesson.slug}"
					class="group flex items-center gap-4 px-4 py-3.5 rounded-xl border bg-white transition-all
						{done ? 'border-emerald-200 bg-emerald-50/50' : 'border-zinc-200 hover:border-zinc-300 hover:shadow-sm'}"
				>
					<!-- Number / check -->
					<span
						class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
							{done ? 'bg-success text-white' : 'bg-zinc-100 text-zinc-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors'}"
					>
						{#if done}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						{:else}
							{i + 1}
						{/if}
					</span>

					<!-- Content -->
					<div class="flex flex-col gap-0.5 min-w-0 flex-1">
						<span class="font-semibold text-zinc-800 group-hover:text-primary transition-colors text-sm">
							{lesson.title}
						</span>
						<span class="text-xs text-zinc-500 truncate">{lesson.description}</span>
					</div>

					<!-- Meta -->
					<div class="flex items-center gap-3 shrink-0">
						<span class="text-xs text-zinc-400">{lesson.estimatedMinutes} min</span>
						<svg
							class="text-zinc-300 group-hover:text-primary transition-colors"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<polyline points="9 18 15 12 9 6"></polyline>
						</svg>
					</div>
				</a>
			{/each}
		</div>

		<!-- Start CTA -->
		{#if pct === 0}
			<div class="mt-6 flex justify-center">
				<a
					href="/learn/{track.slug}/{track.lessons[0].slug}"
					class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors shadow-sm"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<polygon points="5 3 19 12 5 21 5 3"></polygon>
					</svg>
					Start this track
				</a>
			</div>
		{:else if pct < 100}
			{@const nextLesson = track.lessons.find((l) => !progress.isComplete(track.slug, l.slug))}
			{#if nextLesson}
				<div class="mt-6 flex justify-center">
					<a
						href="/learn/{track.slug}/{nextLesson.slug}"
						class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors shadow-sm"
					>
						Continue where you left off →
					</a>
				</div>
			{/if}
		{/if}
	</div>
{/if}
