<script lang="ts">
	import { compoundInterest } from '$lib/math/calculations';
	import { formatCurrency } from '$lib/utils/format';
	import Slider from '$lib/components/ui/Slider.svelte';

	let {
		initialPrincipal = 1000,
		initialMonthlyContrib = 200,
		initialRate = 8,
		initialYears = 30,
	}: {
		initialPrincipal?: number;
		initialMonthlyContrib?: number;
		initialRate?: number;
		initialYears?: number;
	} = $props();

	// Use $state for local editable values; sync from props when they change
	let principal = $state(0);
	let monthlyContrib = $state(0);
	let annualRate = $state(0);
	let years = $state(0);

	$effect(() => { principal = initialPrincipal; });
	$effect(() => { monthlyContrib = initialMonthlyContrib; });
	$effect(() => { annualRate = initialRate; });
	$effect(() => { years = initialYears; });

	const result = $derived(
		compoundInterest({ principal, monthlyContribution: monthlyContrib, annualRate, years }),
	);

	// SVG chart dimensions
	const W = 480;
	const H = 200;
	const PAD = { top: 12, right: 12, bottom: 28, left: 52 };
	const chartW = W - PAD.left - PAD.right;
	const chartH = H - PAD.top - PAD.bottom;

	const chartData = $derived(result.yearlyBalances);
	const maxBalance = $derived(Math.max(...chartData.map((d) => d.balance), 1));

	function xScale(year: number): number {
		return PAD.left + (year / years) * chartW;
	}
	function yScale(val: number): number {
		return PAD.top + chartH - (val / maxBalance) * chartH;
	}

	const contributionPath = $derived(
		chartData
			.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(d.year)},${yScale(d.contributed)}`)
			.join(' '),
	);
	const balancePath = $derived(
		chartData
			.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(d.year)},${yScale(d.balance)}`)
			.join(' '),
	);
	const areaPath = $derived(
		`${balancePath} L${xScale(years)},${PAD.top + chartH} L${PAD.left},${PAD.top + chartH} Z`,
	);
	const contributionArea = $derived(
		`${contributionPath} L${xScale(years)},${PAD.top + chartH} L${PAD.left},${PAD.top + chartH} Z`,
	);

	// Y axis labels
	const yTicks = $derived(
		[0, 0.25, 0.5, 0.75, 1].map((t) => ({
			y: PAD.top + chartH - t * chartH,
			label: formatCurrency(t * maxBalance, 0),
		})),
	);

	// X axis labels (every 5 years)
	const xTicks = $derived(
		Array.from({ length: Math.floor(years / 5) + 1 }, (_, i) => i * 5).filter((y) => y <= years),
	);
</script>

<div class="flex flex-col gap-5">
	<!-- Inputs -->
	<div class="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 flex flex-col gap-4">
		<h3 class="text-sm font-semibold text-zinc-700">Your Numbers</h3>

		<div class="grid grid-cols-2 gap-4">
			<label class="flex flex-col gap-1">
				<span class="text-xs font-medium text-zinc-500">Starting amount</span>
				<div class="relative">
					<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
					<input
						type="number"
						bind:value={principal}
						min="0"
						max="1000000"
						step="100"
						class="w-full pl-6 pr-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-xs font-medium text-zinc-500">Monthly contribution</span>
				<div class="relative">
					<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
					<input
						type="number"
						bind:value={monthlyContrib}
						min="0"
						max="10000"
						step="50"
						class="w-full pl-6 pr-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
			</label>
		</div>

		<Slider
			bind:value={annualRate}
			min={1}
			max={15}
			step={0.5}
			label="Annual return rate"
			formatValue={(v) => `${v}%`}
		/>

		<Slider
			bind:value={years}
			min={1}
			max={50}
			step={1}
			label="Time horizon"
			formatValue={(v) => `${v} years`}
		/>
	</div>

	<!-- Outputs -->
	<div class="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 flex flex-col gap-4">
		<h3 class="text-sm font-semibold text-zinc-700">Results after {years} years</h3>

		<div class="grid grid-cols-3 gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs text-zinc-500">Final balance</span>
				<span class="text-xl font-bold font-mono text-primary tabular-nums">
					{formatCurrency(result.finalBalance)}
				</span>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs text-zinc-500">Total contributed</span>
				<span class="text-lg font-semibold font-mono text-zinc-700 tabular-nums">
					{formatCurrency(result.totalContributed)}
				</span>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs text-zinc-500">Interest earned</span>
				<span class="text-lg font-semibold font-mono text-accent tabular-nums">
					{formatCurrency(result.totalInterest)}
				</span>
			</div>
		</div>

		<!-- Growth multiplier callout -->
		{#if result.totalContributed > 0}
			<div class="bg-primary/5 rounded-lg px-3 py-2 text-xs text-zinc-600">
				Your money grows to
				<strong class="text-primary">
					{(result.finalBalance / result.totalContributed).toFixed(1)}×
				</strong>
				what you put in.
			</div>
		{/if}

		<!-- Chart -->
		<div>
			<div class="flex items-center gap-3 mb-2 text-xs text-zinc-500">
				<span class="flex items-center gap-1">
					<span class="inline-block w-3 h-1 rounded bg-emerald-400"></span> Contributions
				</span>
				<span class="flex items-center gap-1">
					<span class="inline-block w-3 h-1 rounded bg-amber-400"></span> Interest earned
				</span>
			</div>
			<svg viewBox="0 0 {W} {H}" class="w-full" role="img" aria-label="Compound interest growth chart">
				<defs>
					<linearGradient id="ci-grad-interest" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="rgb(251 191 36)" stop-opacity="0.6" />
						<stop offset="100%" stop-color="rgb(251 191 36)" stop-opacity="0.1" />
					</linearGradient>
					<linearGradient id="ci-grad-contrib" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="rgb(52 211 153)" stop-opacity="0.8" />
						<stop offset="100%" stop-color="rgb(52 211 153)" stop-opacity="0.3" />
					</linearGradient>
				</defs>

				<!-- Grid lines -->
				{#each yTicks as tick}
					<line
						x1={PAD.left}
						y1={tick.y}
						x2={W - PAD.right}
						y2={tick.y}
						stroke="#e4e4e7"
						stroke-width="1"
						stroke-dasharray={tick.label.includes('$0') ? '' : '3,3'}
					/>
				{/each}

				<!-- Stacked areas -->
				<path d={areaPath} fill="url(#ci-grad-interest)" />
				<path d={contributionArea} fill="url(#ci-grad-contrib)" />

				<!-- Lines -->
				<path d={balancePath} fill="none" stroke="rgb(251 191 36)" stroke-width="2" />
				<path d={contributionPath} fill="none" stroke="rgb(52 211 153)" stroke-width="1.5" stroke-dasharray="4,2" />

				<!-- Y axis labels -->
				{#each yTicks as tick}
					<text
						x={PAD.left - 4}
						y={tick.y}
						text-anchor="end"
						dominant-baseline="middle"
						font-size="8"
						fill="#71717a"
					>{tick.label}</text>
				{/each}

				<!-- X axis labels -->
				{#each xTicks as yr}
					<text
						x={xScale(yr)}
						y={H - 4}
						text-anchor="middle"
						font-size="8"
						fill="#71717a"
					>Yr {yr}</text>
				{/each}
			</svg>
		</div>
	</div>
</div>
