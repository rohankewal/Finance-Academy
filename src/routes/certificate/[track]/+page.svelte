<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { getSupabaseClient } from '$lib/supabase/client';
	import { TRACKS } from '$lib/data/tracks';
	import type { LessonCompletion } from '$lib/types/database';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const track = $derived(data.track);

	let completions = $state<LessonCompletion[]>([]);
	let completedAt = $state<string | null>(null);
	let isComplete = $state(false);
	let loading = $state(true);

	onMount(async () => {
		const supabase = getSupabaseClient();
		if (!supabase || !auth.user) { loading = false; return; }

		const { data: res } = await supabase
			.from('lesson_completions')
			.select('*')
			.eq('user_id', auth.user.id)
			.eq('track_slug', track.slug)
			.order('completed_at', { ascending: false });

		completions = (res ?? []) as LessonCompletion[];
		isComplete = track.lessons.every((l) =>
			completions.some((c) => c.lesson_slug === l.slug),
		);
		if (isComplete && completions.length > 0) {
			completedAt = completions[0].completed_at;
		}
		loading = false;
	});

	function shareOnLinkedIn() {
		const url = encodeURIComponent(window.location.href);
		const title = encodeURIComponent(`I completed ${track.title} on Finance Academy!`);
		window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, '_blank');
	}

	function print() {
		window.print();
	}
</script>

<svelte:head>
	<title>{track.title} Certificate — Finance Academy</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
	{#if loading}
		<div class="text-zinc-400 text-sm">Loading…</div>
	{:else if !auth.isLoggedIn}
		<div class="text-center py-16">
			<p class="text-zinc-500 mb-4">Sign in to view your certificate.</p>
			<a href="/auth/signin" class="text-primary font-medium hover:underline">Sign in →</a>
		</div>
	{:else if !isComplete}
		<div class="text-center py-16">
			<p class="text-4xl mb-3">📚</p>
			<h1 class="text-xl font-bold text-zinc-900">Not yet complete</h1>
			<p class="text-zinc-500 mt-1 text-sm">Finish all {track.lessons.length} lessons in {track.title} to earn your certificate.</p>
			<a href="/learn/{track.slug}" class="mt-4 inline-block text-sm text-primary font-medium hover:underline">
				Continue track →
			</a>
		</div>
	{:else}
		<!-- Certificate -->
		<div class="print:m-0">
			<!-- Print actions (hidden in print) -->
			<div class="flex gap-3 mb-6 print:hidden">
				<button
					type="button"
					onclick={shareOnLinkedIn}
					class="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0077B5] text-white text-sm font-semibold hover:bg-[#006097] transition-colors"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
					Share on LinkedIn
				</button>
				<button
					type="button"
					onclick={print}
					class="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-sm font-medium hover:bg-zinc-50 transition-colors"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
					Print
				</button>
			</div>

			<!-- Certificate card -->
			<div class="bg-white border-4 border-primary/20 rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center gap-6">
				<!-- Academy seal -->
				<div class="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
					<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
						<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
						<polyline points="17 6 23 6 23 12"></polyline>
					</svg>
				</div>

				<div class="flex flex-col items-center gap-1">
					<p class="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Certificate of Completion</p>
					<p class="text-sm text-zinc-400">Finance Academy</p>
				</div>

				<div class="flex flex-col items-center gap-2">
					<p class="text-lg text-zinc-500">This certifies that</p>
					<p class="text-3xl sm:text-4xl font-bold text-zinc-900">
						{auth.profile?.display_name ?? auth.user?.email?.split('@')[0] ?? 'Learner'}
					</p>
					<p class="text-lg text-zinc-500">has successfully completed</p>
					<p class="text-2xl sm:text-3xl font-bold text-primary">{track.title}</p>
				</div>

				<div class="flex flex-col items-center gap-1 text-sm text-zinc-400">
					<p>{track.lessons.length} lessons completed</p>
					{#if completedAt}
						<p>
							{new Date(completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
						</p>
					{/if}
				</div>

				<div class="flex gap-2 mt-2">
					{#each track.lessons as lesson}
						<div class="w-2 h-2 rounded-full bg-primary/30" title={lesson.title}></div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	@media print {
		:global(header), :global(footer), :global(aside) { display: none !important; }
	}
</style>
