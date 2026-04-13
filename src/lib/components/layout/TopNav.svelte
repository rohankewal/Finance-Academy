<script lang="ts">
	import { page } from '$app/stores';
	import { progress } from '$lib/stores/progress.svelte';

	let { onMenuClick }: { onMenuClick: () => void } = $props();

	const overallPct = $derived(progress.overallProgress());
	const completed = $derived(progress.completedCount());
	const total = $derived(progress.totalCount());

	const links = [
		{ href: '/learn', label: 'Learn' },
		{ href: '/calculators', label: 'Calculators' },
		{ href: '/glossary', label: 'Glossary' },
	];

	function isActive(href: string): boolean {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}
</script>

<header class="fixed top-0 left-0 right-0 z-40 bg-white border-b border-zinc-200 h-[var(--topnav-height)]">
	<div class="flex items-center h-full px-4 gap-4">
		<!-- Hamburger (mobile) -->
		<button
			type="button"
			onclick={onMenuClick}
			class="lg:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
			aria-label="Open navigation"
		>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="3" y1="6" x2="21" y2="6"></line>
				<line x1="3" y1="12" x2="21" y2="12"></line>
				<line x1="3" y1="18" x2="21" y2="18"></line>
			</svg>
		</button>

		<!-- Logo -->
		<a href="/" class="flex items-center gap-2 text-zinc-900 font-bold text-lg tracking-tight shrink-0">
			<div class="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
					<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
					<polyline points="17 6 23 6 23 12"></polyline>
				</svg>
			</div>
			<span class="hidden sm:block">Finance <span class="text-primary">Academy</span></span>
		</a>

		<!-- Nav links (center) -->
		<nav class="hidden lg:flex items-center gap-1 flex-1 justify-center">
			{#each links as link}
				<a
					href={link.href}
					class="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors
						{isActive(link.href)
						? 'text-primary bg-primary/8'
						: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'}"
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<!-- Progress indicator (right) -->
		<div class="ml-auto flex items-center gap-3 shrink-0">
			{#if completed > 0}
				<div class="hidden sm:flex flex-col items-end gap-0.5">
					<span class="text-xs text-zinc-500 font-medium">{completed}/{total} lessons</span>
					<div class="w-24 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
						<div
							class="h-full rounded-full bg-primary transition-all duration-300"
							style="width: {overallPct}%"
						></div>
					</div>
				</div>
			{/if}
			<a
				href="/learn"
				class="hidden sm:flex text-sm font-medium px-3.5 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
			>
				{completed > 0 ? 'Continue' : 'Start learning'}
			</a>
		</div>
	</div>
</header>
