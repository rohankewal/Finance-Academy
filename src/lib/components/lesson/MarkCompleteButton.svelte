<script lang="ts">
	import { progress } from '$lib/stores/progress.svelte';

	let {
		trackSlug,
		lessonSlug,
	}: {
		trackSlug: string;
		lessonSlug: string;
	} = $props();

	const done = $derived(progress.isComplete(trackSlug, lessonSlug));

	function toggle() {
		if (done) {
			progress.markIncomplete(trackSlug, lessonSlug);
		} else {
			progress.markComplete(trackSlug, lessonSlug);
		}
	}
</script>

<button
	type="button"
	onclick={toggle}
	class="flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all
		{done
		? 'bg-success/10 text-success border border-success/20 hover:bg-success/15'
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
