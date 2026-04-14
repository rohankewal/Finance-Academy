<script lang="ts">
	import BudgetBuilderCalc from '$lib/components/calculators/BudgetBuilderCalc.svelte';
	import CalculatorTracker from '$lib/components/calculators/CalculatorTracker.svelte';
</script>
<CalculatorTracker slug="budget-builder" />

<svelte:head>
	<title>Budget Builder (50/30/20) — Finance Academy</title>
	<meta name="description" content="Build a budget using the 50/30/20 rule. Customize your needs, wants, and savings allocations and track your actual spending." />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
	<div class="mb-6">
		<nav class="text-sm text-zinc-500 mb-2">
			<a href="/calculators" class="hover:text-zinc-700">Calculators</a>
			<span class="mx-1.5">›</span>
			<span class="text-zinc-700">Budget Builder</span>
		</nav>
		<h1 class="text-3xl font-bold tracking-tight text-zinc-900">Budget Builder</h1>
		<p class="mt-1 text-zinc-500">The 50/30/20 rule as a starting point — then make it yours.</p>
	</div>

	<BudgetBuilderCalc />

	<div class="mt-6 bg-zinc-50 rounded-xl border border-zinc-200 p-5">
		<h3 class="text-sm font-semibold text-zinc-700 mb-2">What this teaches you</h3>
		<p class="text-sm text-zinc-600 leading-relaxed">
			The <strong>50/30/20 rule</strong> is a simple framework: spend 50% of after-tax income on needs
			(housing, food, utilities), 30% on wants (restaurants, streaming, clothes), and save/invest the remaining 20%.
			It's not a perfect formula — someone in San Francisco spending 60% on rent isn't failing, they're living in an expensive city.
			The real goal is to have an intentional plan for your money rather than spending by default.
		</p>
	</div>
</div>
