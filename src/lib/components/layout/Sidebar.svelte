<script lang="ts">
	import { page } from '$app/stores';
	import { TRACKS } from '$lib/data/tracks';
	import { progress } from '$lib/stores/progress.svelte';

	let { class: className = '' }: { class?: string } = $props();

	// Track which track accordions are open
	const currentPath = $derived($page.url.pathname);

	function isCurrentLesson(trackSlug: string, lessonSlug: string): boolean {
		return currentPath === `/learn/${trackSlug}/${lessonSlug}`;
	}

	function isCurrentTrack(trackSlug: string): boolean {
		return currentPath.startsWith(`/learn/${trackSlug}`);
	}

	function trackPercent(trackSlug: string): number {
		return progress.trackProgress(trackSlug);
	}

	function isLessonDone(trackSlug: string, lessonSlug: string): boolean {
		return progress.isComplete(trackSlug, lessonSlug);
	}

	const accentMap: Record<string, string> = {
		emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
		amber: 'text-amber-600 bg-amber-50 border-amber-200',
		blue: 'text-blue-600 bg-blue-50 border-blue-200',
	};

	// Keep open tracks that contain the current lesson
	let openTracks = $state<Record<string, boolean>>(
		Object.fromEntries(TRACKS.map((t) => [t.slug, true])),
	);
</script>

<aside class="flex flex-col h-full overflow-y-auto py-4 px-3 {className}">
	<!-- Learn header -->
	<div class="mb-2 px-2">
		<a
			href="/learn"
			class="text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-colors"
		>
			Courses
		</a>
	</div>

	<!-- Tracks -->
	{#each TRACKS as track}
		{@const pct = trackPercent(track.slug)}
		{@const isOpen = openTracks[track.slug]}
		{@const isActive = isCurrentTrack(track.slug)}

		<div class="mb-1">
			<!-- Track header (accordion trigger) -->
			<button
				type="button"
				onclick={() => (openTracks[track.slug] = !openTracks[track.slug])}
				class="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors
					{isActive ? 'bg-zinc-100' : 'hover:bg-zinc-50'}"
			>
				<!-- Chevron -->
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					class="shrink-0 transition-transform text-zinc-400 {isOpen ? 'rotate-90' : ''}"
				>
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>

				<div class="flex flex-col gap-0.5 min-w-0 flex-1">
					<span class="text-sm font-semibold text-zinc-800 truncate">{track.title}</span>
					{#if pct > 0}
						<div class="flex items-center gap-1.5">
							<div class="flex-1 h-1 rounded-full bg-zinc-200 overflow-hidden">
								<div
									class="h-full rounded-full bg-primary transition-all"
									style="width: {pct}%"
								></div>
							</div>
							<span class="text-[10px] text-zinc-400 tabular-nums">{pct}%</span>
						</div>
					{/if}
				</div>
			</button>

			<!-- Lessons list -->
			{#if isOpen}
				<div class="ml-4 mt-0.5 border-l border-zinc-100 pl-2 flex flex-col gap-0.5">
					{#each track.lessons as lesson, i}
						{@const done = isLessonDone(track.slug, lesson.slug)}
						{@const current = isCurrentLesson(track.slug, lesson.slug)}

						<a
							href="/learn/{track.slug}/{lesson.slug}"
							class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors group
								{current
								? 'sidebar-link-active'
								: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'}"
						>
							<!-- Number / checkmark -->
							<span
								class="shrink-0 w-4 h-4 flex items-center justify-center text-[10px] rounded-full
									{done
									? 'bg-success text-white'
									: current
									? 'bg-primary text-white'
									: 'bg-zinc-200 text-zinc-500 group-hover:bg-zinc-300'}"
							>
								{#if done}
									<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
										<polyline points="20 6 9 17 4 12"></polyline>
									</svg>
								{:else}
									{i + 1}
								{/if}
							</span>

							<span class="truncate leading-snug">{lesson.title}</span>

							<!-- Est. time -->
							<span class="ml-auto shrink-0 text-[10px] text-zinc-400 tabular-nums">
								{lesson.estimatedMinutes}m
							</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	{/each}

	<!-- Divider -->
	<div class="my-3 border-t border-zinc-100"></div>

	<!-- Secondary nav -->
	<div class="flex flex-col gap-0.5">
		{#each [{ href: '/calculators', label: 'Calculators', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z' }, { href: '/glossary', label: 'Glossary', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' }] as link}
			<a
				href={link.href}
				class="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors
					{currentPath.startsWith(link.href)
					? 'text-primary bg-primary/8 font-medium'
					: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'}"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0">
					<path d={link.icon}></path>
				</svg>
				{link.label}
			</a>
		{/each}
	</div>
</aside>
