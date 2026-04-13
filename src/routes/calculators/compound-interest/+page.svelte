<script lang="ts">
	import CompoundInterestCalc from '$lib/components/calculators/CompoundInterestCalc.svelte';
</script>

<svelte:head>
	<title>Compound Interest Calculator — Finance Academy</title>
	<meta name="description" content="See how your investments grow over time with compound interest. Adjust principal, monthly contributions, return rate, and years." />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
	<div class="mb-6">
		<nav class="text-sm text-zinc-500 mb-2">
			<a href="/calculators" class="hover:text-zinc-700">Calculators</a>
			<span class="mx-1.5">›</span>
			<span class="text-zinc-700">Compound Interest</span>
		</nav>
		<h1 class="text-3xl font-bold tracking-tight text-zinc-900">Compound Interest Calculator</h1>
		<p class="mt-1 text-zinc-500">See exactly how your money can grow — and why time is the most powerful variable.</p>
	</div>

	<CompoundInterestCalc />

	<div class="mt-6 bg-zinc-50 rounded-xl border border-zinc-200 p-5">
		<h3 class="text-sm font-semibold text-zinc-700 mb-2">What this teaches you</h3>
		<p class="text-sm text-zinc-600 leading-relaxed">
			Compound interest is the process of earning returns on your returns — not just your original investment.
			The key insight: <strong>time in the market matters far more than timing the market</strong>.
			Starting 10 years earlier can more than double your final balance, even with the same total contributions.
			This is why financial advisors say to start investing the moment you have an emergency fund.
		</p>
	</div>
</div>
