<script lang="ts">
	import { TRACKS } from '$lib/data/tracks';
	import { progress } from '$lib/stores/progress.svelte';

	const accentStyles: Record<string, { badge: string; icon: string; bar: string; border: string }> = {
		emerald: {
			badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
			icon: 'bg-emerald-100 text-emerald-600',
			bar: 'bg-emerald-500',
			border: 'hover:border-emerald-300',
		},
		amber: {
			badge: 'bg-amber-50 text-amber-700 border-amber-200',
			icon: 'bg-amber-100 text-amber-600',
			bar: 'bg-amber-500',
			border: 'hover:border-amber-300',
		},
		blue: {
			badge: 'bg-blue-50 text-blue-700 border-blue-200',
			icon: 'bg-blue-100 text-blue-600',
			bar: 'bg-blue-500',
			border: 'hover:border-blue-300',
		},
	};

	const iconPaths: Record<string, string> = {
		Wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
		CreditCard: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
		TrendingUp: 'M23 6l-9.5 9.5-5-5L1 18',
	};
</script>

<svelte:head>
	<title>Learn — Finance Academy</title>
	<meta name="description" content="Learn money, debt, and investing through structured lessons built for people who were never taught this stuff." />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight text-zinc-900">All Courses</h1>
		<p class="mt-1.5 text-zinc-500">Start anywhere. Each track is self-contained — or work through them in order.</p>
	</div>

	<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each TRACKS as track}
			{@const style = accentStyles[track.accent] ?? accentStyles.emerald}
			{@const pct = progress.trackProgress(track.slug)}
			{@const nextLesson = track.lessons.find((l) => !progress.isComplete(track.slug, l.slug))}

			<a
				href="/learn/{track.slug}"
				class="group flex flex-col gap-4 p-5 bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-all {style.border}"
			>
				<!-- Icon -->
				<div class="w-10 h-10 rounded-xl {style.icon} flex items-center justify-center">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d={iconPaths[track.icon] ?? iconPaths.TrendingUp}></path>
					</svg>
				</div>

				<!-- Content -->
				<div class="flex flex-col gap-1.5 flex-1">
					<h2 class="font-bold text-zinc-900 text-base group-hover:text-primary transition-colors">
						{track.title}
					</h2>
					<p class="text-sm text-zinc-500 leading-relaxed">{track.description}</p>
				</div>

				<!-- Meta -->
				<div class="flex items-center justify-between">
					<span class="text-xs font-medium px-2 py-0.5 rounded-full border {style.badge}">
						{track.lessons.length} lessons
					</span>
					{#if pct > 0 && pct < 100}
						<span class="text-xs text-zinc-500">{pct}% done</span>
					{:else if pct === 100}
						<span class="text-xs text-success font-medium flex items-center gap-1">
							<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
							Complete
						</span>
					{/if}
				</div>

				{#if pct > 0 && pct < 100}
					<div class="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
						<div class="h-full rounded-full {style.bar} transition-all" style="width: {pct}%"></div>
					</div>
				{/if}
			</a>
		{/each}
	</div>

	<!-- Overall progress -->
	{#if progress.completedCount() > 0}
		<div class="mt-8 p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center gap-4">
			<div class="flex-1">
				<p class="text-sm font-medium text-zinc-700">
					{progress.completedCount()} of {progress.totalCount()} lessons complete
				</p>
				<div class="mt-1.5 h-2 rounded-full bg-zinc-200 overflow-hidden">
					<div
						class="h-full rounded-full bg-primary transition-all"
						style="width: {progress.overallProgress()}%"
					></div>
				</div>
			</div>
			<span class="text-lg font-bold text-primary tabular-nums">{progress.overallProgress()}%</span>
		</div>
	{/if}
</div>
