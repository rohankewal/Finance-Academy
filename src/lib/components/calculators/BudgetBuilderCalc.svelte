<script lang="ts">
	import { formatCurrency } from '$lib/utils/format';
	import Slider from '$lib/components/ui/Slider.svelte';

	let income = $state(4000);
	let needsPct = $state(50);
	let wantsPct = $state(30);
	let savingsPct = $state(20);

	// Actual spending (optional)
	let actualNeeds = $state(0);
	let actualWants = $state(0);
	let showActual = $state(false);

	// Keep percents summing to 100 when sliders change
	function adjustNeeds(v: number) {
		const remaining = 100 - v;
		const ratio = wantsPct / (wantsPct + savingsPct) || 0.6;
		wantsPct = Math.round(remaining * ratio);
		savingsPct = 100 - v - wantsPct;
		needsPct = v;
	}

	function adjustWants(v: number) {
		const remaining = 100 - needsPct - v;
		savingsPct = Math.max(0, remaining);
		wantsPct = v;
	}

	function adjustSavings(v: number) {
		const remaining = 100 - needsPct - v;
		wantsPct = Math.max(0, remaining);
		savingsPct = v;
	}

	const needsDollar = $derived((income * needsPct) / 100);
	const wantsDollar = $derived((income * wantsPct) / 100);
	const savingsDollar = $derived((income * savingsPct) / 100);

	const needsVariance = $derived(actualNeeds > 0 ? needsDollar - actualNeeds : null);
	const wantsVariance = $derived(actualWants > 0 ? wantsDollar - actualWants : null);

	// Donut chart
	const R = 70;
	const CX = 100;
	const CY = 100;
	const innerR = 42;

	type Arc = { path: string; color: string; label: string; pct: number };

	function polarToXY(angleDeg: number, r: number) {
		const rad = ((angleDeg - 90) * Math.PI) / 180;
		return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
	}

	function makeArc(startDeg: number, endDeg: number): string {
		const large = endDeg - startDeg > 180 ? 1 : 0;
		const outer1 = polarToXY(startDeg, R);
		const outer2 = polarToXY(endDeg, R);
		const inner1 = polarToXY(endDeg, innerR);
		const inner2 = polarToXY(startDeg, innerR);
		return `M${outer1.x},${outer1.y} A${R},${R} 0 ${large},1 ${outer2.x},${outer2.y} L${inner1.x},${inner1.y} A${innerR},${innerR} 0 ${large},0 ${inner2.x},${inner2.y} Z`;
	}

	function buildSegments(n: number, w: number, s: number): Arc[] {
		const total = n + w + s;
		if (total === 0) return [];
		let startDeg = 0;
		const items = [
			{ pct: n, color: '#10b981', label: 'Needs' },
			{ pct: w, color: '#f59e0b', label: 'Wants' },
			{ pct: s, color: '#3b82f6', label: 'Savings' },
		];
		return items.map((item) => {
			const sweep = (item.pct / total) * 360;
			const arc = makeArc(startDeg, startDeg + sweep - 0.5);
			startDeg += sweep;
			return { path: arc, color: item.color, label: item.label, pct: item.pct };
		});
	}

	const segments: Arc[] = $derived(buildSegments(needsPct, wantsPct, savingsPct));
</script>

<div class="flex flex-col gap-5">
	<!-- Income input -->
	<label class="flex flex-col gap-1">
		<span class="text-sm font-semibold text-zinc-700">Monthly after-tax income</span>
		<div class="relative">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
			<input
				type="number"
				bind:value={income}
				min="0"
				step="100"
				class="w-full pl-7 pr-3 py-2.5 text-base font-mono rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary"
			/>
		</div>
	</label>

	<!-- Sliders -->
	<div class="flex flex-col gap-3 p-4 bg-zinc-50 rounded-xl">
		<Slider
			bind:value={needsPct}
			min={0}
			max={100}
			step={1}
			label="Needs (housing, food, utilities)"
			formatValue={(v) => `${v}%`}
			oninput={(v) => adjustNeeds(v)}
		/>
		<Slider
			bind:value={wantsPct}
			min={0}
			max={100}
			step={1}
			label="Wants (dining, entertainment, subscriptions)"
			formatValue={(v) => `${v}%`}
			oninput={(v) => adjustWants(v)}
		/>
		<Slider
			bind:value={savingsPct}
			min={0}
			max={100}
			step={1}
			label="Savings & debt repayment"
			formatValue={(v) => `${v}%`}
			oninput={(v) => adjustSavings(v)}
		/>
		<p class="text-xs text-zinc-400 text-right">Total: {needsPct + wantsPct + savingsPct}%</p>
	</div>

	<!-- Budget breakdown table -->
	<div class="bg-white rounded-xl border border-zinc-200 p-4 flex flex-col gap-3">
		<h3 class="text-sm font-semibold text-zinc-700">Your Budget Allocation</h3>

		{#each [
			{ label: 'Needs', pct: needsPct, dollar: needsDollar, color: 'bg-emerald-500', actual: actualNeeds, variance: needsVariance },
			{ label: 'Wants', pct: wantsPct, dollar: wantsDollar, color: 'bg-amber-500', actual: actualWants, variance: wantsVariance },
			{ label: 'Savings', pct: savingsPct, dollar: savingsDollar, color: 'bg-blue-500', actual: null, variance: null },
		] as item}
			<div class="flex items-center gap-3">
				<span class="w-2.5 h-2.5 rounded-sm shrink-0 {item.color}"></span>
				<span class="text-sm text-zinc-700 flex-1">{item.label}</span>
				<span class="text-sm text-zinc-500 tabular-nums w-10 text-right">{item.pct}%</span>
				<span class="text-sm font-semibold font-mono text-zinc-800 tabular-nums w-20 text-right">
					{formatCurrency(item.dollar)}
				</span>
				{#if showActual && item.actual !== null && item.variance !== null}
					<span
						class="text-xs font-mono tabular-nums w-16 text-right {item.variance >= 0 ? 'text-success' : 'text-danger'}"
					>
						{item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)}
					</span>
				{/if}
			</div>
		{/each}

		<div class="border-t border-zinc-100 pt-2 flex items-center justify-between">
			<span class="text-xs text-zinc-500">Total income</span>
			<span class="text-sm font-semibold font-mono text-zinc-800">{formatCurrency(income)}</span>
		</div>
	</div>

	<!-- Donut chart + toggle -->
	<div class="flex items-center gap-6">
		<svg viewBox="0 0 200 200" class="w-40 shrink-0" role="img" aria-label="Budget allocation donut chart">
			{#each segments as seg}
				<path d={seg.path} fill={seg.color} opacity="0.85" />
			{/each}
			<!-- Center text -->
			<text x={CX} y={CY - 6} text-anchor="middle" font-size="11" font-weight="600" fill="#18181b">
				{formatCurrency(income, 0)}
			</text>
			<text x={CX} y={CY + 8} text-anchor="middle" font-size="8" fill="#71717a">per month</text>
		</svg>

		<div class="flex flex-col gap-2 flex-1">
			{#each [
				{ label: 'Needs', color: 'bg-emerald-500', dollar: needsDollar },
				{ label: 'Wants', color: 'bg-amber-500', dollar: wantsDollar },
				{ label: 'Savings', color: 'bg-blue-500', dollar: savingsDollar },
			] as item}
				<div class="flex items-center gap-2">
					<span class="w-2 h-2 rounded-sm {item.color} shrink-0"></span>
					<span class="text-xs text-zinc-600 flex-1">{item.label}</span>
					<span class="text-xs font-mono font-medium text-zinc-700 tabular-nums">
						{formatCurrency(item.dollar)}/mo
					</span>
				</div>
			{/each}

			<!-- Track actual spending toggle -->
			<button
				type="button"
				onclick={() => (showActual = !showActual)}
				class="mt-1 text-xs text-primary hover:text-primary-dark font-medium text-left"
			>
				{showActual ? '− Hide actual spending' : '+ Track actual spending'}
			</button>
		</div>
	</div>

	{#if showActual}
		<div class="flex flex-col gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
			<h4 class="text-xs font-semibold text-zinc-600">This month's actual spending</h4>
			<div class="grid grid-cols-2 gap-3">
				{#each [
					{ label: 'Actual Needs', bind: 'actualNeeds' },
					{ label: 'Actual Wants', bind: 'actualWants' },
				] as field}
					<label class="flex flex-col gap-1">
						<span class="text-xs text-zinc-500">{field.label}</span>
						<div class="relative">
							<span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">$</span>
							{#if field.bind === 'actualNeeds'}
								<input type="number" bind:value={actualNeeds} min="0" class="w-full pl-5 pr-2 py-1.5 text-sm font-mono rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary" />
							{:else}
								<input type="number" bind:value={actualWants} min="0" class="w-full pl-5 pr-2 py-1.5 text-sm font-mono rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary" />
							{/if}
						</div>
					</label>
				{/each}
			</div>
		</div>
	{/if}
</div>
