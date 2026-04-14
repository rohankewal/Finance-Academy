<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Track, Lesson } from '$lib/data/tracks';
	import { setContext } from 'svelte';
	import MarkCompleteButton from './MarkCompleteButton.svelte';
	import NextPrevNav from './NextPrevNav.svelte';
	import ProgressBar from './ProgressBar.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { notifications } from '$lib/stores/notifications.svelte';
	import type { Badge } from '$lib/types/database';

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

	// Completion context — shared with MarkCompleteButton and QuickQuiz via Svelte context
	let completionFired = false;

	async function handleComplete(quizPassed: boolean, quizAttempts: number) {
		if (completionFired) return;
		completionFired = true;

		if (!auth.isLoggedIn) return; // localStorage-only for logged-out users

		try {
			const res = await fetch('/api/lessons/complete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					trackSlug: track.slug,
					lessonSlug: lesson.slug,
					quizPassed,
					quizAttempts,
				}),
			});

			if (!res.ok) return;

			const data = await res.json() as {
				xpEarned: number;
				newBadges: Badge[];
				levelUp: boolean;
				newLevel: { level: number; name: string } | null;
				streakMilestone: number | null;
				currentStreak: number;
			};

			// Show XP toast
			if (data.xpEarned > 0) {
				notifications.addXpToast(data.xpEarned, 'Lesson complete!');
			}

			// Show badge modals
			for (const badge of data.newBadges) {
				notifications.queueBadge(badge);
			}

			// Show level up modal
			if (data.levelUp && data.newLevel) {
				notifications.queueLevelUp(data.newLevel.level, data.newLevel.name);
			}

			// Show streak celebration
			if (data.streakMilestone) {
				notifications.queueStreak(data.streakMilestone);
			}

			// Refresh profile so TopNav XP/streak updates
			await auth.refreshProfile();
		} catch {
			// Network error — silent fail; localStorage progress already saved
			completionFired = false; // allow retry
		}
	}

	setContext('lesson-complete', { complete: handleComplete });
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

		<!-- Sign-up nudge for logged-out users -->
		{#if !auth.isLoggedIn && !auth.loading}
			<div class="mt-6 flex items-center justify-between gap-4 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm">
				<span class="text-zinc-600">
					<strong class="text-zinc-800">Save your progress</strong> across devices — free, no spam.
				</span>
				<a
					href="/auth/signin"
					class="shrink-0 px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors"
				>
					Sign up free
				</a>
			</div>
		{/if}

		<!-- Prev / Next navigation -->
		<NextPrevNav {prev} {next} />
	</div>
</div>
