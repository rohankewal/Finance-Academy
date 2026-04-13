<script lang="ts">
	import TaxBracketCalc from '$lib/components/calculators/TaxBracketCalc.svelte';
</script>

<svelte:head>
	<title>Tax Bracket Explainer — Finance Academy</title>
	<meta name="description" content="Understand exactly how federal income taxes work. See your effective vs marginal rate and debunk the bracket myth." />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
	<div class="mb-6">
		<nav class="text-sm text-zinc-500 mb-2">
			<a href="/calculators" class="hover:text-zinc-700">Calculators</a>
			<span class="mx-1.5">›</span>
			<span class="text-zinc-700">Tax Bracket Explainer</span>
		</nav>
		<h1 class="text-3xl font-bold tracking-tight text-zinc-900">Tax Bracket Explainer</h1>
		<p class="mt-1 text-zinc-500">How progressive taxation actually works — and why a raise never hurts you.</p>
	</div>

	<TaxBracketCalc />

	<div class="mt-6 bg-zinc-50 rounded-xl border border-zinc-200 p-5">
		<h3 class="text-sm font-semibold text-zinc-700 mb-2">What this teaches you</h3>
		<p class="text-sm text-zinc-600 leading-relaxed">
			The US uses a <strong>progressive tax system</strong> with marginal brackets.
			Your "tax bracket" refers to your marginal rate — the rate on your last dollar of income.
			But you don't pay that rate on <em>all</em> your income. Every dollar is taxed at the rate of the bracket it falls in.
			Someone earning $100,000 pays 10% on their first $11,600, 12% on the next chunk, and so on.
			Their effective rate ends up around 17% — far lower than the 22% marginal rate.
			This calculator uses 2024 federal brackets and applies the standard deduction.
		</p>
	</div>
</div>
