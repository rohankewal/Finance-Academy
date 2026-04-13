<script lang="ts">
	import LessonLayout from '$lib/components/lesson/LessonLayout.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.lesson.title} — {data.track.title} — Finance Academy</title>
	<meta name="description" content={data.lesson.description} />
</svelte:head>

<LessonLayout track={data.track} lesson={data.lesson} prev={data.prev} next={data.next}>
	{#if data.Component}
		{@const C = data.Component}
		<C />
	{/if}
</LessonLayout>
