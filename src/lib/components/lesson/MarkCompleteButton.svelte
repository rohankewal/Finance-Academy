<script lang="ts">
	import { progress } from '$lib/stores/progress.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { getContext } from 'svelte';

	let {
		trackSlug,
		lessonSlug,
	}: {
		trackSlug: string;
		lessonSlug: string;
	} = $props();

	type CompletionContext = {
		complete: (quizPassed: boolean, quizAttempts: number) => void;
	};

	const ctx = getContext<CompletionContext | undefined>('lesson-complete');
	const done = $derived(progress.isComplete(trackSlug, lessonSlug));

	function toggle() {
		if (done && auth.isLoggedIn) return; // can't un-complete if logged in
		if (done) {
			progress.markIncomplete(trackSlug, lessonSlug);
		} else {
			progress.markComplete(trackSlug, lessonSlug);
			ctx?.complete(false, 0);
		}
	}
</script>

<button
	type="button"
	onclick={toggle}
	disabled={done && auth.isLoggedIn}
	class="flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all
		{done
		? 'bg-success/10 text-success border border-success/20 cursor-default'
		: 'bg-primary text-white hover:bg-primary-dark shadow-sm'}"
>
	{#if done}
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
			<polyline points="20 6 9 17 4 12"></polyline>
		</svg>
		Lesson complete
	{:else}
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="12" cy="12" r="10"></circle>
			<polyline points="12 8 12 12 14 14"></polyline>
		</svg>
		Mark as complete
	{/if}
</button>
