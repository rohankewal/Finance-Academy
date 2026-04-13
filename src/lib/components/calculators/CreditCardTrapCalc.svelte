<script lang="ts">
	import { amortize, creditCardMinPayment } from '$lib/math/calculations';
	import { formatCurrency, formatMonths, addMonthsToDate } from '$lib/utils/format';
	import Slider from '$lib/components/ui/Slider.svelte';

	let balance = $state(3500);
	let apr = $state(24.99);
	let useMinOnly = $state(false);
	let extraAmount = $state(50);

	const minPayment = $derived(creditCardMinPayment(balance));
	const monthlyPayment = $derived(useMinOnly ? minPayment : minPayment + extraAmount);
	const minResult = $derived(amortize({ balance, apr, monthlyPayment: minPayment }));
	const extraResult = $derived(amortize({ balance, apr, monthlyPayment: minPayment + extraAmount }));
	const currentResult = $derived(useMinOnly ? minResult : extraResult);

	const interestSaved = $derived(minResult.totalInterest - extraResult.totalInterest);
	const monthsSaved = $derived(minResult.monthsToPayoff - extraResult.monthsToPayoff);

	// Chart: two line trajectories (min vs min+extra)
	const W = 480;
	const H = 180;
	const PAD = { top: 8, right: 8, bottom: 24, left: 52 };
	const chartW = W - PAD.left - PAD.right;
	const chartH = H - PAD.top - PAD.bottom;

	const maxMonths = $derived(Math.max(minResult.monthsToPayoff, extraResult.monthsToPayoff, 1));
	const maxBalance2 = $derived(balance);

	function xScale(month: number): number {
		return PAD.left + (month / maxMonths) * chartW;
	}
	function yScale(val: number): number {
		return PAD.top + chartH - (val / maxBalance2) * chartH;
	}

	type LinePoint = { month: number; balance: number };

	const minPoints: LinePoint[] = $derived([
		{ month: 0, balance },
		...minResult.schedule.map((s) => ({ month: s.month, balance: s.balance })),
	]);
	const extraPoints: LinePoint[] = $derived([
		{ month: 0, balance },
		...extraResult.schedule.map((s) => ({ month: s.month, balance: s.balance })),
	]);

	function toPath(points: LinePoint[]): string {
		return points
			.map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p.month)},${yScale(p.balance)}`)
			.join(' ');
	}

	const yTicks = $derived(
		[0, 0.25, 0.5, 0.75, 1].map((t) => ({
			y: PAD.top + chartH - t * chartH,
			label: formatCurrency(t * maxBalance2, 0),
		})),
	);
</script>

<div class="flex flex-col gap-5">
	<!-- Inputs -->
	<div class="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 flex flex-col gap-4">
		<h3 class="text-sm font-semibold text-zinc-700">Your Credit Card</h3>

		<div class="grid grid-cols-2 gap-4">
			<label class="flex flex-col gap-1">
				<span class="text-xs font-medium text-zinc-500">Current balance</span>
				<div class="relative">
					<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
					<input
						type="number"
						bind:value={balance}
						min="0"
						max="100000"
						step="100"
						class="w-full pl-7 pr-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-xs font-medium text-zinc-500">APR (%)</span>
				<input
					type="number"
					bind:value={apr}
					min="0"
					max="100"
					step="0.1"
					class="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary"
				/>
			</label>
		</div>

		<!-- Minimum payment toggle -->
		<div class="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
			<button
				type="button"
				role="switch"
				aria-checked={useMinOnly}
				aria-label="Minimum payments only"
				onclick={() => (useMinOnly = !useMinOnly)}
				class="relative w-9 h-5 rounded-full transition-colors {useMinOnly ? 'bg-danger' : 'bg-zinc-300'}"
			>
				<span
					class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform {useMinOnly ? 'translate-x-4' : ''}"
				></span>
			</button>
			<div class="flex flex-col">
				<span class="text-sm text-zinc-700 font-medium">Minimum payments only</span>
				<span class="text-xs text-zinc-500">Min = {formatCurrency(minPayment)}/mo (2% or $25)</span>
			</div>
		</div>

		{#if !useMinOnly}
			<Slider
				bind:value={extraAmount}
				min={10}
				max={500}
				step={10}
				label="Extra payment per month"
				formatValue={(v) => `+${formatCurrency(v)}`}
			/>
		{/if}
	</div>

	<!-- Results comparison -->
	<div class="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 flex flex-col gap-4">
		<h3 class="text-sm font-semibold text-zinc-700">Payoff Comparison</h3>

		<div class="grid grid-cols-2 gap-3">
			<!-- Min only column -->
			<div class="bg-red-50 rounded-xl p-3 border border-red-100 flex flex-col gap-2">
				<span class="text-xs font-semibold text-red-600">Minimum only</span>
				<div class="flex flex-col gap-1">
					<span class="text-xs text-red-400">Monthly payment</span>
					<span class="text-base font-bold font-mono text-red-700">{formatCurrency(minPayment)}</span>
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-xs text-red-400">Payoff time</span>
					<span class="text-sm font-semibold font-mono text-red-700">
						{#if minResult.monthsToPayoff >= 600}∞{:else}{formatMonths(minResult.monthsToPayoff)}{/if}
					</span>
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-xs text-red-400">Total interest</span>
					<span class="text-sm font-semibold font-mono text-red-700">{formatCurrency(minResult.totalInterest)}</span>
				</div>
			</div>

			<!-- With extra column -->
			<div class="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex flex-col gap-2">
				<span class="text-xs font-semibold text-emerald-600">
					{useMinOnly ? 'Min only' : `Min + ${formatCurrency(extraAmount)}`}
				</span>
				<div class="flex flex-col gap-1">
					<span class="text-xs text-emerald-600">Monthly payment</span>
					<span class="text-base font-bold font-mono text-emerald-700">{formatCurrency(minPayment + extraAmount)}</span>
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-xs text-emerald-600">Payoff time</span>
					<span class="text-sm font-semibold font-mono text-emerald-700">
						{formatMonths(extraResult.monthsToPayoff)}
					</span>
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-xs text-emerald-600">Total interest</span>
					<span class="text-sm font-semibold font-mono text-emerald-700">{formatCurrency(extraResult.totalInterest)}</span>
				</div>
			</div>
		</div>

		<!-- Savings callout -->
		{#if interestSaved > 5 && !useMinOnly}
			<div class="bg-primary/8 rounded-xl px-4 py-3 flex items-start gap-3">
				<svg class="text-primary shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
				<div class="text-sm text-zinc-700">
					Adding just <strong class="text-primary">{formatCurrency(extraAmount)}/month</strong> saves you
					<strong class="text-success">{formatCurrency(interestSaved)}</strong> in interest
					and gets you debt-free <strong class="text-primary">{formatMonths(monthsSaved)} earlier</strong>.
				</div>
			</div>
		{/if}

		<!-- Chart: two trajectories -->
		<div>
			<div class="flex items-center gap-4 text-xs text-zinc-500 mb-2">
				<span class="flex items-center gap-1.5">
					<span class="inline-block w-4 h-0.5 bg-red-400"></span> Minimum only
				</span>
				<span class="flex items-center gap-1.5">
					<span class="inline-block w-4 h-0.5 bg-emerald-500"></span>
					Min + {formatCurrency(extraAmount)}
				</span>
			</div>
			<svg viewBox="0 0 {W} {H}" class="w-full" role="img" aria-label="Debt balance trajectories">
				<defs>
					<linearGradient id="cc-min-grad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="rgb(239 68 68)" stop-opacity="0.2" />
						<stop offset="100%" stop-color="rgb(239 68 68)" stop-opacity="0.03" />
					</linearGradient>
				</defs>

				<!-- Grid lines -->
				{#each yTicks as tick}
					<line x1={PAD.left} y1={tick.y} x2={W - PAD.right} y2={tick.y} stroke="#e4e4e7" stroke-width="1" stroke-dasharray="3,3" />
					<text x={PAD.left - 4} y={tick.y} text-anchor="end" dominant-baseline="middle" font-size="8" fill="#71717a">{tick.label}</text>
				{/each}

				<!-- Min payment area + line -->
				<path
					d="{toPath(minPoints)} L{xScale(minResult.monthsToPayoff)},{PAD.top + chartH} L{PAD.left},{PAD.top + chartH} Z"
					fill="url(#cc-min-grad)"
				/>
				<path d={toPath(minPoints)} fill="none" stroke="#f87171" stroke-width="2" />

				<!-- Extra payment line -->
				<path d={toPath(extraPoints)} fill="none" stroke="#10b981" stroke-width="2.5" />

				<!-- Payoff markers -->
				{#if minResult.monthsToPayoff < 600}
					<circle cx={xScale(minResult.monthsToPayoff)} cy={PAD.top + chartH} r="3" fill="#f87171" />
				{/if}
				<circle cx={xScale(extraResult.monthsToPayoff)} cy={PAD.top + chartH} r="3" fill="#10b981" />

				<!-- X axis -->
				<line x1={PAD.left} y1={PAD.top + chartH} x2={W - PAD.right} y2={PAD.top + chartH} stroke="#e4e4e7" stroke-width="1" />
			</svg>
		</div>
	</div>
</div>
