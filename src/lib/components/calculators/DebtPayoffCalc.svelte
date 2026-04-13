<script lang="ts">
	import { debtPayoff, type Debt } from '$lib/math/calculations';
	import { formatCurrency, formatMonths, addMonthsToDate } from '$lib/utils/format';

	let strategy = $state<'avalanche' | 'snowball'>('avalanche');
	let extraPayment = $state(100);

	let debts = $state<Debt[]>([
		{ id: '1', name: 'Credit Card', balance: 5000, apr: 22.99, minimumPayment: 100 },
		{ id: '2', name: 'Student Loan', balance: 15000, apr: 5.5, minimumPayment: 160 },
		{ id: '3', name: 'Car Loan', balance: 8000, apr: 7.9, minimumPayment: 185 },
	]);

	let nextId = $state(4);

	function addDebt() {
		debts = [
			...debts,
			{ id: String(nextId++), name: 'New Debt', balance: 1000, apr: 15, minimumPayment: 25 },
		];
	}

	function removeDebt(id: string) {
		debts = debts.filter((d) => d.id !== id);
	}

	function updateDebt(id: string, field: keyof Debt, rawValue: string) {
		debts = debts.map((d) => {
			if (d.id !== id) return d;
			if (field === 'name') return { ...d, name: rawValue };
			const num = parseFloat(rawValue);
			return { ...d, [field]: isNaN(num) ? 0 : num };
		});
	}

	const avalancheResult = $derived(
		debtPayoff({ debts: debts.filter((d) => d.balance > 0), extraPayment, strategy: 'avalanche' }),
	);
	const snowballResult = $derived(
		debtPayoff({ debts: debts.filter((d) => d.balance > 0), extraPayment, strategy: 'snowball' }),
	);
	const result = $derived(strategy === 'avalanche' ? avalancheResult : snowballResult);

	const interestSavings = $derived(
		Math.abs(snowballResult.totalInterest - avalancheResult.totalInterest),
	);

	// Chart
	const W = 480;
	const H = 180;
	const PAD = { top: 8, right: 8, bottom: 24, left: 48 };
	const chartW = W - PAD.left - PAD.right;
	const chartH = H - PAD.top - PAD.bottom;

	const maxBalance = $derived(
		debts.reduce((sum, d) => sum + Math.max(0, d.balance), 0),
	);

	const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

	function xScale(month: number): number {
		return PAD.left + (month / Math.max(result.monthsToPayoff, 1)) * chartW;
	}
	function yScale(val: number): number {
		return PAD.top + chartH - (val / Math.max(maxBalance, 1)) * chartH;
	}

	const totalPath = $derived(
		result.schedule.length === 0
			? ''
			: result.schedule
					.map((s, i) => `${i === 0 ? 'M' : 'L'}${xScale(s.month)},${yScale(s.totalBalance)}`)
					.join(' '),
	);
</script>

<div class="flex flex-col gap-5">
	<!-- Strategy toggle -->
	<div class="flex rounded-lg border border-zinc-200 overflow-hidden">
		{#each [{ v: 'avalanche', label: 'Avalanche', sub: 'Highest APR first' }, { v: 'snowball', label: 'Snowball', sub: 'Smallest balance first' }] as opt}
			<button
				type="button"
				onclick={() => (strategy = opt.v as 'avalanche' | 'snowball')}
				class="flex-1 flex flex-col items-center py-2.5 text-sm transition-colors
					{strategy === opt.v
					? 'bg-primary text-white font-semibold'
					: 'bg-white text-zinc-600 hover:bg-zinc-50'}"
			>
				<span class="font-medium">{opt.label}</span>
				<span class="text-xs opacity-70">{opt.sub}</span>
			</button>
		{/each}
	</div>

	<!-- Debt rows -->
	<div class="flex flex-col gap-2">
		<div class="grid grid-cols-[1fr_80px_60px_70px_24px] gap-1.5 text-xs font-medium text-zinc-500 px-1">
			<span>Debt name</span>
			<span>Balance</span>
			<span>APR%</span>
			<span>Min pmt</span>
			<span></span>
		</div>
		{#each debts as debt}
			<div class="grid grid-cols-[1fr_80px_60px_70px_24px] gap-1.5 items-center">
				<input
					type="text"
					value={debt.name}
					oninput={(e) => updateDebt(debt.id, 'name', (e.target as HTMLInputElement).value)}
					class="px-2 py-1.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary truncate"
				/>
				<div class="relative">
					<span class="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400">$</span>
					<input
						type="number"
						value={debt.balance}
						oninput={(e) => updateDebt(debt.id, 'balance', (e.target as HTMLInputElement).value)}
						min="0"
						class="w-full pl-4 pr-1 py-1.5 text-sm font-mono rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary"
					/>
				</div>
				<input
					type="number"
					value={debt.apr}
					oninput={(e) => updateDebt(debt.id, 'apr', (e.target as HTMLInputElement).value)}
					min="0"
					max="100"
					step="0.1"
					class="px-2 py-1.5 text-sm font-mono rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary"
				/>
				<div class="relative">
					<span class="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400">$</span>
					<input
						type="number"
						value={debt.minimumPayment}
						oninput={(e) => updateDebt(debt.id, 'minimumPayment', (e.target as HTMLInputElement).value)}
						min="1"
						class="w-full pl-4 pr-1 py-1.5 text-sm font-mono rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary"
					/>
				</div>
				<button
					type="button"
					onclick={() => removeDebt(debt.id)}
					aria-label="Remove {debt.name}"
					class="w-6 h-6 rounded flex items-center justify-center text-zinc-300 hover:text-danger hover:bg-danger/10 transition-colors"
				>
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
		{/each}
		<button
			type="button"
			onclick={addDebt}
			class="flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark font-medium mt-1 w-fit"
		>
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<line x1="12" y1="5" x2="12" y2="19"></line>
				<line x1="5" y1="12" x2="19" y2="12"></line>
			</svg>
			Add debt
		</button>
	</div>

	<!-- Extra payment -->
	<label class="flex flex-col gap-1">
		<span class="text-xs font-medium text-zinc-500">Extra monthly payment</span>
		<div class="relative">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
			<input
				type="number"
				bind:value={extraPayment}
				min="0"
				step="25"
				class="w-full pl-7 pr-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary"
			/>
		</div>
	</label>

	<!-- Results -->
	<div class="bg-zinc-50 rounded-xl p-4 flex flex-col gap-3">
		<div class="grid grid-cols-3 gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs text-zinc-500">Payoff time</span>
				<span class="text-base font-bold font-mono text-primary">{formatMonths(result.monthsToPayoff)}</span>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs text-zinc-500">Total interest</span>
				<span class="text-base font-bold font-mono text-danger">{formatCurrency(result.totalInterest)}</span>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs text-zinc-500">Debt-free date</span>
				<span class="text-sm font-semibold text-zinc-700">
					{addMonthsToDate(new Date(), result.monthsToPayoff)}
				</span>
			</div>
		</div>

		{#if interestSavings > 10}
			<div class="text-xs text-zinc-600 bg-white rounded-lg px-3 py-2 border border-zinc-100">
				{#if strategy === 'avalanche'}
					The avalanche strategy saves you <strong class="text-success">{formatCurrency(interestSavings)}</strong> vs. snowball.
				{:else}
					Switching to avalanche would save you <strong class="text-success">{formatCurrency(interestSavings)}</strong> in interest.
				{/if}
			</div>
		{/if}

		<!-- Simplified balance chart -->
		{#if result.schedule.length > 0}
			<svg viewBox="0 0 {W} {H}" class="w-full mt-1" role="img" aria-label="Debt balance over time">
				{#each debts as debt, i}
					{@const color = COLORS[i % COLORS.length]}
					{@const pts = result.schedule
						.map((s) => `${xScale(s.month)},${yScale(s.balancesByDebt[debt.id] ?? 0)}`)
						.join(' ')}
					{#if pts}
						<polyline
							points="{xScale(0)},{yScale(debt.balance)} {pts}"
							fill="none"
							stroke={color}
							stroke-width="2"
							opacity="0.85"
						/>
					{/if}
				{/each}

				<!-- Baseline -->
				<line x1={PAD.left} y1={PAD.top + chartH} x2={W - PAD.right} y2={PAD.top + chartH} stroke="#e4e4e7" stroke-width="1" />

				<!-- Legend -->
				{#each debts as debt, i}
					<rect x={PAD.left + (i * 90)} y={H - 10} width={8} height={8} fill={COLORS[i % COLORS.length]} rx="1" />
					<text x={PAD.left + (i * 90) + 11} y={H - 3} font-size="8" fill="#71717a">{debt.name}</text>
				{/each}
			</svg>
		{/if}
	</div>

	<!-- Strategy explainer -->
	<div class="text-xs text-zinc-500 leading-relaxed">
		{#if strategy === 'avalanche'}
			<strong class="text-zinc-700">Avalanche:</strong> Extra payments go to your highest-APR debt first. This minimizes total interest paid — mathematically optimal.
		{:else}
			<strong class="text-zinc-700">Snowball:</strong> Extra payments go to your smallest balance first. You pay off debts faster and the wins build momentum — psychologically powerful.
		{/if}
	</div>
</div>
