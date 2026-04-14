<script lang="ts">
	import { TRACKS } from '$lib/data/tracks';

	let {
		completions,
	}: {
		completions: Array<{ track_slug: string; lesson_slug: string }>;
	} = $props();

	const nextLesson = $derived.by(() => {
		// Find the first incomplete lesson across all tracks (in order)
		for (const track of TRACKS) {
			for (const lesson of track.lessons) {
				const done = completions.some(
					(c) => c.track_slug === track.slug && c.lesson_slug === lesson.slug,
				);
				if (!done) return { track, lesson };
			}
		}
		return null; // all complete
	});
</script>

{#if nextLesson}
	<div class="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/15 p-5 flex items-center justify-between gap-4">
		<div class="flex flex-col gap-1">
			<p class="text-xs font-semibold text-primary/70 uppercase tracking-wide">Up next</p>
			<h3 class="font-bold text-zinc-900">{nextLesson.lesson.title}</h3>
			<p class="text-xs text-zinc-500">{nextLesson.track.title} · {nextLesson.lesson.estimatedMinutes} min</p>
		</div>
		<a
			href="/learn/{nextLesson.track.slug}/{nextLesson.lesson.slug}"
			class="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
		>
			Continue
			<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<polyline points="9 18 15 12 9 6"></polyline>
			</svg>
		</a>
	</div>
{:else}
	<div class="bg-gradient-to-br from-success/5 to-success/10 rounded-xl border border-success/15 p-5 flex items-center justify-between gap-4">
		<div class="flex flex-col gap-1">
			<p class="text-xs font-semibold text-success/70 uppercase tracking-wide">🎓 All done!</p>
			<h3 class="font-bold text-zinc-900">You've completed every lesson</h3>
			<p class="text-xs text-zinc-500">Share your achievement or revisit any lesson.</p>
		</div>
		<a
			href="/learn"
			class="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-success text-white text-sm font-semibold hover:bg-success/90 transition-colors"
		>
			Browse
		</a>
	</div>
{/if}
