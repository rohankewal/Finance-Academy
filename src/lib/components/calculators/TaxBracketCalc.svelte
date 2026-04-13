<script lang="ts">
	import { federalTax } from '$lib/math/calculations';
	import { formatCurrency, formatPercent } from '$lib/utils/format';
	import type { FilingStatus } from '$lib/data/taxBrackets';

	let income = $state(65000);
	let filingStatus = $state<FilingStatus>('single');

	const result = $derived(federalTax({ income, filingStatus }));

	const BRACKET_COLORS: Record<number, string> = {
		0.10: '#10b981',
		0.12: '#34d399',
		0.22: '#fbbf24',
		0.24: '#f59e0b',
		0.32: '#f97316',
		0.35: '#ef4444',
		0.37: '#dc2626',
	};

	// Horizontal bar chart: each segment = income taxed at that rate
	const barW = 400;
	const barH = 28;
	const totalTaxableIncome = $derived(result.taxableIncome);

	type BarSegment = {
		x: number;
		width: number;
		color: string;
		rate: number;
		amount: number;
		tax: number;
	};

	function computeBarSegments(breakdown: typeof result.bracketBreakdown, taxable: number): BarSegment[] {
		let x = 0;
		return breakdown.map((b) => {
			const w = taxable > 0 ? (b.amountInBracket / taxable) * barW : 0;
			const seg: BarSegment = { x, width: w, color: BRACKET_COLORS[b.rate] ?? '#94a3b8', rate: b.rate, amount: b.amountInBracket, tax: b.taxFromBracket };
			x += w;
			return seg;
		});
	}

	const barSegments: BarSegment[] = $derived(computeBarSegments(result.bracketBreakdown, totalTaxableIncome));
</script>

<div class="flex flex-col gap-5">
	<!-- Inputs -->
	<div class="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 flex flex-col gap-4">
		<h3 class="text-sm font-semibold text-zinc-700">Your Income</h3>

		<label class="flex flex-col gap-1">
			<span class="text-xs font-medium text-zinc-500">Annual gross income</span>
			<div class="relative">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
				<input
					type="number"
					bind:value={income}
					min="0"
					max="2000000"
					step="1000"
					class="w-full pl-7 pr-3 py-2.5 text-base font-mono rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary"
				/>
			</div>
		</label>

		<div class="flex flex-col gap-1">
			<span class="text-xs font-medium text-zinc-500">Filing status</span>
			<div class="flex rounded-lg border border-zinc-200 overflow-hidden">
				{#each [{ v: 'single', label: 'Single' }, { v: 'married_jointly', label: 'Married Filing Jointly' }] as opt}
					<button
						type="button"
						onclick={() => (filingStatus = opt.v as FilingStatus)}
						class="flex-1 py-2 text-sm transition-colors
							{filingStatus === opt.v
							? 'bg-primary text-white font-semibold'
							: 'bg-white text-zinc-600 hover:bg-zinc-50'}"
					>
						{opt.label}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Results -->
	<div class="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 flex flex-col gap-4">
		<h3 class="text-sm font-semibold text-zinc-700">Tax Summary</h3>

		<div class="grid grid-cols-2 gap-3">
			<div class="bg-zinc-50 rounded-lg p-3 flex flex-col gap-0.5">
				<span class="text-xs text-zinc-500">Total federal tax</span>
				<span class="text-xl font-bold font-mono text-danger tabular-nums">
					{formatCurrency(result.totalTax)}
				</span>
			</div>
			<div class="bg-zinc-50 rounded-lg p-3 flex flex-col gap-0.5">
				<span class="text-xs text-zinc-500">Take-home pay</span>
				<span class="text-xl font-bold font-mono text-success tabular-nums">
					{formatCurrency(result.takeHome)}
				</span>
			</div>
			<div class="bg-zinc-50 rounded-lg p-3 flex flex-col gap-0.5">
				<span class="text-xs text-zinc-500">Effective tax rate</span>
				<span class="text-lg font-bold font-mono text-zinc-700 tabular-nums">
					{formatPercent(result.effectiveRate * 100)}
				</span>
			</div>
			<div class="bg-zinc-50 rounded-lg p-3 flex flex-col gap-0.5">
				<span class="text-xs text-zinc-500">Marginal rate</span>
				<span class="text-lg font-bold font-mono text-zinc-700 tabular-nums">
					{formatPercent(result.marginalRate * 100)}
				</span>
			</div>
		</div>

		<!-- Deduction note -->
		<div class="text-xs text-zinc-500 bg-zinc-50 rounded-lg px-3 py-2">
			Standard deduction applied: <strong class="text-zinc-700">{formatCurrency(result.standardDeduction)}</strong>.
			Taxable income: <strong class="text-zinc-700">{formatCurrency(result.taxableIncome)}</strong>.
		</div>

		<!-- Horizontal bracket bar -->
		{#if barSegments.length > 0}
			<div>
				<p class="text-xs font-medium text-zinc-500 mb-2">How your income is taxed by bracket</p>
				<svg viewBox="0 0 {barW} {barH + 40}" class="w-full" role="img" aria-label="Tax bracket breakdown">
					<!-- Segments -->
					{#each barSegments as seg, i}
						{#if seg.width > 0}
							<rect x={seg.x} y={0} width={seg.width} height={barH} fill={seg.color} opacity="0.85" rx={i === 0 ? 4 : 0} />
						{/if}
					{/each}
					<!-- Rate labels inside bars -->
					{#each barSegments as seg}
						{#if seg.width > 32}
							<text
								x={seg.x + seg.width / 2}
								y={barH / 2}
								text-anchor="middle"
								dominant-baseline="middle"
								font-size="9"
								font-weight="600"
								fill="white"
							>
								{Math.round(seg.rate * 100)}%
							</text>
						{/if}
					{/each}
				</svg>

				<!-- Bracket breakdown table -->
				<div class="mt-3 flex flex-col gap-1">
					{#each result.bracketBreakdown as b}
						<div class="flex items-center gap-2 text-xs">
							<span
								class="w-2 h-2 rounded-sm shrink-0"
								style="background: {BRACKET_COLORS[b.rate]}"
							></span>
							<span class="text-zinc-500 w-8 tabular-nums">{Math.round(b.rate * 100)}%</span>
							<span class="text-zinc-600 flex-1">
								{formatCurrency(b.amountInBracket)} taxed at this rate
							</span>
							<span class="text-zinc-700 font-mono font-medium tabular-nums">
								= {formatCurrency(b.taxFromBracket)}
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Myth-busting note -->
		<div class="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-900">
			<strong>Common myth busted:</strong> Moving into a higher bracket does NOT tax all your income at the new rate.
			Only the dollars <em>above</em> the bracket threshold are taxed at the higher rate.
			A raise will always increase your take-home pay.
		</div>
	</div>
</div>
