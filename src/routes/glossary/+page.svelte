<script lang="ts">
	import { GLOSSARY_TERMS, getGlossaryLetters, getTermsByLetter } from '$lib/data/glossary';

	let search = $state('');

	const letters = $derived(getGlossaryLetters());

	const filteredTerms = $derived(
		search.trim().length > 0
			? GLOSSARY_TERMS.filter(
					(t) =>
						t.term.toLowerCase().includes(search.toLowerCase()) ||
						t.definition.toLowerCase().includes(search.toLowerCase()),
				)
			: null, // null = show all alphabetically
	);

	function scrollToLetter(letter: string) {
		const el = document.getElementById(`letter-${letter}`);
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
</script>

<svelte:head>
	<title>Glossary — Finance Academy</title>
	<meta name="description" content="Financial terms defined clearly — APR, APY, compound interest, index funds, ETFs, 401(k), Roth IRA, and 40+ more." />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight text-zinc-900">Glossary</h1>
		<p class="mt-1 text-zinc-500">
			{GLOSSARY_TERMS.length} financial terms, defined without the jargon.
		</p>
	</div>

	<!-- Search -->
	<div class="relative mb-6">
		<svg
			class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<circle cx="11" cy="11" r="8"></circle>
			<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
		</svg>
		<input
			type="search"
			bind:value={search}
			placeholder="Search terms and definitions…"
			class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
		/>
		{#if search}
			<button
				type="button"
				onclick={() => (search = '')}
				aria-label="Clear search"
				class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		{/if}
	</div>

	{#if filteredTerms !== null}
		<!-- Search results -->
		{#if filteredTerms.length === 0}
			<div class="text-center py-12">
				<p class="text-zinc-500">No terms match "<strong>{search}</strong>".</p>
				<button onclick={() => (search = '')} class="mt-2 text-sm text-primary hover:underline">
					Clear search
				</button>
			</div>
		{:else}
			<p class="text-xs text-zinc-400 mb-4">{filteredTerms.length} result{filteredTerms.length !== 1 ? 's' : ''} for "{search}"</p>
			<div class="flex flex-col gap-3">
				{#each filteredTerms as term}
					<div class="p-4 rounded-xl border border-zinc-200 bg-white">
						<div class="flex items-start justify-between gap-3">
							<h3 class="font-semibold text-zinc-900">{term.term}</h3>
							{#if term.learnMoreHref}
								<a
									href={term.learnMoreHref}
									class="shrink-0 text-xs text-primary hover:underline"
								>
									Learn more →
								</a>
							{/if}
						</div>
						<p class="mt-1.5 text-sm text-zinc-600 leading-relaxed">{term.definition}</p>
					</div>
				{/each}
			</div>
		{/if}
	{:else}
		<!-- Alphabetical jump nav -->
		<div class="flex flex-wrap gap-1.5 mb-8 pb-4 border-b border-zinc-100">
			{#each letters as letter}
				<button
					type="button"
					onclick={() => scrollToLetter(letter)}
					class="w-7 h-7 rounded-md text-xs font-semibold text-zinc-600 hover:bg-primary hover:text-white transition-colors"
				>
					{letter}
				</button>
			{/each}
		</div>

		<!-- Terms by letter -->
		{#each letters as letter}
			{@const terms = getTermsByLetter(letter)}
			<div id="letter-{letter}" class="mb-8">
				<h2 class="text-xl font-bold text-zinc-900 mb-3 flex items-center gap-2">
					<span class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-extrabold text-sm">
						{letter}
					</span>
				</h2>
				<div class="flex flex-col gap-2.5">
					{#each terms as term}
						<div
							id="term-{term.term.toLowerCase().replace(/\s+/g, '-')}"
							class="p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-colors"
						>
							<div class="flex items-start justify-between gap-3">
								<h3 class="font-semibold text-zinc-900">{term.term}</h3>
								{#if term.learnMoreHref}
									<a
										href={term.learnMoreHref}
										class="shrink-0 text-xs text-primary hover:underline font-medium"
									>
										Learn more →
									</a>
								{/if}
							</div>
							<p class="mt-1.5 text-sm text-zinc-600 leading-relaxed">{term.definition}</p>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</div>
