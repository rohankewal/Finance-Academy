<script lang="ts">
	import CreditCardTrapCalc from '$lib/components/calculators/CreditCardTrapCalc.svelte';
	import CalculatorTracker from '$lib/components/calculators/CalculatorTracker.svelte';
</script>
<CalculatorTracker slug="credit-card-trap" />

<svelte:head>
	<title>Credit Card Interest Trap — Finance Academy</title>
	<meta name="description" content="See the true cost of credit card minimum payments — and how a small extra payment can save you thousands." />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
	<div class="mb-6">
		<nav class="text-sm text-zinc-500 mb-2">
			<a href="/calculators" class="hover:text-zinc-700">Calculators</a>
			<span class="mx-1.5">›</span>
			<span class="text-zinc-700">Credit Card Interest Trap</span>
		</nav>
		<h1 class="text-3xl font-bold tracking-tight text-zinc-900">Credit Card Interest Trap</h1>
		<p class="mt-1 text-zinc-500">Minimum payments are designed to keep you in debt as long as possible. See the true cost.</p>
	</div>

	<CreditCardTrapCalc />

	<div class="mt-6 bg-zinc-50 rounded-xl border border-zinc-200 p-5">
		<h3 class="text-sm font-semibold text-zinc-700 mb-2">What this teaches you</h3>
		<p class="text-sm text-zinc-600 leading-relaxed">
			Credit card companies set minimum payments low on purpose — it keeps you paying interest for years.
			A $3,500 balance at 25% APR with only minimum payments can take <strong>10+ years to pay off</strong>
			and cost more in interest than the original balance. Adding just $50 extra per month can cut that in half.
			This calculator shows the exact comparison so you can make an informed decision about how aggressively to pay down your cards.
		</p>
	</div>
</div>
