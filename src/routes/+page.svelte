<script lang="ts">
	import { TRACKS } from '$lib/data/tracks';
	import { progress } from '$lib/stores/progress.svelte';

	const accentStyles: Record<string, { icon: string; bar: string; badge: string }> = {
		emerald: { icon: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
		amber: { icon: 'bg-amber-100 text-amber-600', bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
		blue: { icon: 'bg-blue-100 text-blue-600', bar: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
	};

	const iconPaths: Record<string, string> = {
		Wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
		CreditCard: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
		TrendingUp: 'M23 6l-9.5 9.5-5-5L1 18',
	};

	const features = [
		{ icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Budgeting', desc: 'Build a plan that actually fits your life' },
		{ icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', label: 'Investing', desc: 'Stocks, bonds, index funds explained simply' },
		{ icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', label: 'Debt', desc: 'Credit cards, loans, and how to escape them' },
		{ icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Credit Scores', desc: 'The number that follows you everywhere' },
		{ icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z', label: 'Taxes', desc: 'How brackets really work — no jargon' },
		{ icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Retirement', desc: '401(k), IRA, and building a secure future' },
	];

	const featuredCalcs = [
		{ href: '/calculators/compound-interest', title: 'Compound Interest', desc: 'Watch $200/month grow to $297,000 over 30 years at 8% return.', tag: 'Investing' },
		{ href: '/calculators/debt-payoff', title: 'Debt Payoff Planner', desc: 'Enter your debts and find your debt-free date with avalanche or snowball.', tag: 'Debt' },
		{ href: '/calculators/tax-brackets', title: 'Tax Bracket Explainer', desc: 'See exactly what you owe and bust the "bracket myth" with real numbers.', tag: 'Taxes' },
	];

	const overallPct = $derived(progress.overallProgress());
	const completedCount = $derived(progress.completedCount());
</script>

<svelte:head>
	<title>Finance Academy — Learn Money. Change Your Life.</title>
	<meta name="description" content="Free financial literacy education for young people. Learn budgeting, debt, investing, credit, and taxes through lessons and interactive calculators." />
</svelte:head>

<!-- Hero -->
<section class="relative overflow-hidden bg-white border-b border-zinc-100">
	<div class="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
		<div class="max-w-2xl">
			<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-xs font-semibold text-primary mb-6">
				<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
				Free. No account. No ads.
			</div>
			<h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]">
				Learn money.<br />
				<span class="text-primary">Change your life.</span>
			</h1>
			<p class="mt-5 text-lg text-zinc-500 leading-relaxed max-w-xl">
				11 lessons covering budgeting, credit, debt, and investing — with interactive calculators to make it real.
				No jargon. No prerequisites. Just clear explanations and honest numbers.
			</p>
			<div class="mt-7 flex flex-wrap gap-3">
				<a
					href="/learn"
					class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors shadow-sm"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<polygon points="5 3 19 12 5 21 5 3"></polygon>
					</svg>
					{completedCount > 0 ? 'Continue learning' : 'Start learning'}
				</a>
				<a
					href="/calculators"
					class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-semibold text-sm hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
				>
					Try a calculator
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6"></polyline>
					</svg>
				</a>
			</div>

			{#if overallPct > 0}
				<div class="mt-6 flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200 w-fit">
					<div class="w-28 h-2 rounded-full bg-zinc-200 overflow-hidden">
						<div class="h-full rounded-full bg-primary transition-all" style="width: {overallPct}%"></div>
					</div>
					<span class="text-sm text-zinc-600">{completedCount} lessons complete</span>
				</div>
			{/if}
		</div>
	</div>
</section>

<!-- Track cards -->
<section class="py-14 px-4 sm:px-6 max-w-5xl mx-auto">
	<div class="mb-7">
		<h2 class="text-2xl font-bold tracking-tight text-zinc-900">Three tracks. Real knowledge.</h2>
		<p class="mt-1 text-zinc-500">Start with Money Basics if you're new, or jump to any track you need right now.</p>
	</div>

	<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each TRACKS as track}
			{@const style = accentStyles[track.accent] ?? accentStyles.emerald}
			{@const pct = progress.trackProgress(track.slug)}

			<a
				href="/learn/{track.slug}"
				class="group flex flex-col gap-4 p-5 bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
			>
				<div class="w-10 h-10 rounded-xl flex items-center justify-center {style.icon}">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d={iconPaths[track.icon]}></path>
					</svg>
				</div>

				<div class="flex flex-col gap-1.5 flex-1">
					<h3 class="font-bold text-zinc-900 group-hover:text-primary transition-colors">{track.title}</h3>
					<p class="text-sm text-zinc-500 leading-relaxed">{track.description}</p>
				</div>

				<div class="flex items-center justify-between">
					<span class="text-xs font-medium px-2 py-0.5 rounded-full border {style.badge}">
						{track.lessons.length} lessons
					</span>
					{#if pct === 100}
						<span class="text-xs text-success font-medium">✓ Complete</span>
					{:else if pct > 0}
						<span class="text-xs text-zinc-500">{pct}% done</span>
					{:else}
						<span class="text-xs text-zinc-400 group-hover:text-primary transition-colors">
							Start track →
						</span>
					{/if}
				</div>

				{#if pct > 0 && pct < 100}
					<div class="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
						<div class="h-full rounded-full {style.bar}" style="width: {pct}%"></div>
					</div>
				{/if}
			</a>
		{/each}
	</div>
</section>

<!-- What you'll learn -->
<section class="py-14 border-t border-zinc-100 bg-zinc-50/50">
	<div class="max-w-5xl mx-auto px-4 sm:px-6">
		<div class="mb-8 text-center">
			<h2 class="text-2xl font-bold tracking-tight text-zinc-900">What you'll learn</h2>
			<p class="mt-1 text-zinc-500">Finance skills school forgot to teach you.</p>
		</div>

		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each features as f}
				<div class="flex items-start gap-3 p-4 bg-white rounded-xl border border-zinc-200">
					<div class="shrink-0 w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center mt-0.5">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-primary))" stroke-width="2">
							<path d={f.icon}></path>
						</svg>
					</div>
					<div>
						<p class="text-sm font-semibold text-zinc-800">{f.label}</p>
						<p class="text-xs text-zinc-500 mt-0.5 leading-relaxed">{f.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Featured calculators -->
<section class="py-14 px-4 sm:px-6 max-w-5xl mx-auto">
	<div class="mb-7">
		<h2 class="text-2xl font-bold tracking-tight text-zinc-900">Put your numbers in</h2>
		<p class="mt-1 text-zinc-500">Interactive tools that turn abstract concepts into your actual situation.</p>
	</div>

	<div class="grid sm:grid-cols-3 gap-4">
		{#each featuredCalcs as calc}
			<a
				href={calc.href}
				class="group flex flex-col gap-3 p-5 bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
			>
				<span class="text-xs font-semibold text-primary/80 bg-primary/8 px-2 py-0.5 rounded-full w-fit">
					{calc.tag}
				</span>
				<h3 class="font-semibold text-zinc-900 group-hover:text-primary transition-colors">
					{calc.title}
				</h3>
				<p class="text-xs text-zinc-500 leading-relaxed flex-1">{calc.desc}</p>
				<div class="text-xs font-medium text-zinc-400 group-hover:text-primary transition-colors flex items-center gap-1">
					Open calculator
					<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6"></polyline>
					</svg>
				</div>
			</a>
		{/each}
	</div>

	<div class="mt-4 text-center">
		<a href="/calculators" class="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
			View all 5 calculators →
		</a>
	</div>
</section>
