<script lang="ts">
	const CALCS = [
		{
			href: '/calculators/compound-interest',
			title: 'Compound Interest',
			description: 'See how your money grows over time with initial investment and monthly contributions.',
			icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
			tag: 'Investing',
			color: 'emerald',
		},
		{
			href: '/calculators/debt-payoff',
			title: 'Debt Payoff Planner',
			description: 'Compare avalanche vs. snowball strategies and find your debt-free date.',
			icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
			tag: 'Debt',
			color: 'amber',
		},
		{
			href: '/calculators/budget-builder',
			title: 'Budget Builder (50/30/20)',
			description: 'Allocate your income across needs, wants, and savings. Track actual vs. planned.',
			icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z',
			tag: 'Budgeting',
			color: 'blue',
		},
		{
			href: '/calculators/tax-brackets',
			title: 'Tax Bracket Explainer',
			description: 'See exactly how much you owe in federal taxes — and bust the raise-bracket myth.',
			icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',
			tag: 'Taxes',
			color: 'red',
		},
		{
			href: '/calculators/credit-card-trap',
			title: 'Credit Card Interest Trap',
			description: 'Discover how much minimum payments really cost you — and how $50 extra changes everything.',
			icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
			tag: 'Debt',
			color: 'amber',
		},
	];

	const colorMap: Record<string, string> = {
		emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
		amber: 'bg-amber-50 text-amber-700 border-amber-200',
		blue: 'bg-blue-50 text-blue-700 border-blue-200',
		red: 'bg-red-50 text-red-700 border-red-200',
	};
</script>

<svelte:head>
	<title>Calculators — Finance Academy</title>
	<meta name="description" content="Free financial calculators: compound interest, debt payoff, budget builder, tax brackets, and credit card trap." />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight text-zinc-900">Calculators</h1>
		<p class="mt-2 text-zinc-500">Real tools to put your numbers to work. All calculations happen locally — nothing is saved or sent anywhere.</p>
	</div>

	<div class="grid sm:grid-cols-2 gap-4">
		{#each CALCS as calc}
			<a
				href={calc.href}
				class="group flex flex-col gap-3 p-5 bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all"
			>
				<div class="flex items-center justify-between">
					<div class="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-500 group-hover:text-primary transition-colors">
							<path d={calc.icon}></path>
						</svg>
					</div>
					<span class="text-xs font-semibold px-2 py-0.5 rounded-full border {colorMap[calc.color]}">
						{calc.tag}
					</span>
				</div>
				<div>
					<h2 class="text-base font-semibold text-zinc-900 group-hover:text-primary transition-colors">
						{calc.title}
					</h2>
					<p class="mt-1 text-sm text-zinc-500 leading-relaxed">{calc.description}</p>
				</div>
				<div class="flex items-center gap-1 text-xs font-medium text-zinc-400 group-hover:text-primary transition-colors">
					Open calculator
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6"></polyline>
					</svg>
				</div>
			</a>
		{/each}
	</div>
</div>
