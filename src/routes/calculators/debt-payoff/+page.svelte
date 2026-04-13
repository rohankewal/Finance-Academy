<script lang="ts">
	import DebtPayoffCalc from '$lib/components/calculators/DebtPayoffCalc.svelte';
</script>

<svelte:head>
	<title>Debt Payoff Planner — Finance Academy</title>
	<meta name="description" content="Plan your way out of debt using the avalanche or snowball method. Add your debts, see your payoff date, and compare strategies." />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
	<div class="mb-6">
		<nav class="text-sm text-zinc-500 mb-2">
			<a href="/calculators" class="hover:text-zinc-700">Calculators</a>
			<span class="mx-1.5">›</span>
			<span class="text-zinc-700">Debt Payoff Planner</span>
		</nav>
		<h1 class="text-3xl font-bold tracking-tight text-zinc-900">Debt Payoff Planner</h1>
		<p class="mt-1 text-zinc-500">Add your debts, choose a strategy, and see exactly when you'll be debt-free.</p>
	</div>

	<DebtPayoffCalc />

	<div class="mt-6 bg-zinc-50 rounded-xl border border-zinc-200 p-5">
		<h3 class="text-sm font-semibold text-zinc-700 mb-2">What this teaches you</h3>
		<p class="text-sm text-zinc-600 leading-relaxed">
			<strong>Avalanche</strong> attacks your highest-interest debt first — mathematically optimal and saves the most money.
			<strong>Snowball</strong> clears your smallest balance first — less optimal on paper, but the quick wins build momentum
			and studies show people are more likely to stick with it.
			The best strategy is whichever one you'll actually follow.
			Either way, even a small extra payment dramatically cuts your total interest.
		</p>
	</div>
</div>
