<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Track, Lesson } from '$lib/data/tracks';
	import MarkCompleteButton from './MarkCompleteButton.svelte';
	import NextPrevNav from './NextPrevNav.svelte';
	import ProgressBar from './ProgressBar.svelte';
	import { progress } from '$lib/stores/progress.svelte';

	let {
		track,
		lesson,
		prev,
		next,
		children,
	}: {
		track: Track;
		lesson: Lesson;
		prev: (Lesson & { trackSlug: string }) | null;
		next: (Lesson & { trackSlug: string }) | null;
		children: Snippet;
	} = $props();

	const trackPct = $derived(progress.trackProgress(track.slug));
	const lessonIndex = $derived(track.lessons.findIndex((l) => l.slug === lesson.slug) + 1);
	const totalLessons = $derived(track.lessons.length);

	const accentColors: Record<string, string> = {
		emerald: 'text-emerald-700 bg-emerald-50',
		amber: 'text-amber-700 bg-amber-50',
		blue: 'text-blue-700 bg-blue-50',
	};
	const accentClass = $derived(accentColors[track.accent] ?? accentColors.emerald);
</script>

<div class="min-h-screen">
	<div class="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Breadcrumb -->
		<nav class="flex items-center gap-1.5 text-sm text-zinc-500 mb-6">
			<a href="/learn" class="hover:text-zinc-700 transition-colors">Learn</a>
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="9 18 15 12 9 6"></polyline>
			</svg>
			<a href="/learn/{track.slug}" class="hover:text-zinc-700 transition-colors">{track.title}</a>
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="9 18 15 12 9 6"></polyline>
			</svg>
			<span class="text-zinc-700 font-medium truncate">{lesson.title}</span>
		</nav>

		<!-- Title area -->
		<header class="mb-8">
			<!-- Track badge + meta -->
			<div class="flex flex-wrap items-center gap-2 mb-3">
				<span class="text-xs font-semibold px-2 py-0.5 rounded-full {accentClass}">
					{track.title}
				</span>
				<span class="text-xs text-zinc-400">Lesson {lessonIndex} of {totalLessons}</span>
				<span class="text-xs text-zinc-400">·</span>
				<span class="text-xs text-zinc-400 flex items-center gap-1">
					<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"></circle>
						<polyline points="12 6 12 12 16 14"></polyline>
					</svg>
					{lesson.estimatedMinutes} min read
				</span>
			</div>

			<h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-2">
				{lesson.title}
			</h1>
			<p class="text-base text-zinc-500 leading-relaxed">{lesson.description}</p>

			<!-- Track progress -->
			{#if trackPct > 0}
				<div class="mt-4">
					<ProgressBar value={trackPct} label="{track.title} progress" />
				</div>
			{/if}
		</header>

		<!-- Lesson content -->
		<article class="prose prose-zinc max-w-none lesson-content">
			{@render children()}
		</article>

		<!-- Footer actions -->
		<div class="mt-10 pt-6 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-4">
			<MarkCompleteButton trackSlug={track.slug} lessonSlug={lesson.slug} />
			<div class="text-xs text-zinc-400">
				Finance Academy is for educational purposes only — not financial advice.
			</div>
		</div>

		<!-- Prev / Next navigation -->
		<NextPrevNav {prev} {next} />
	</div>
</div>
