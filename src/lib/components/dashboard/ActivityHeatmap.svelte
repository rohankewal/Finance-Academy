<script lang="ts">
	import type { DailyActivity } from '$lib/types/database';

	let { activity }: { activity: DailyActivity[] } = $props();

	// Build a 90-day grid (13 weeks)
	function buildDays(activity: DailyActivity[]) {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const result: Array<{ date: string; xp: number }> = [];
		for (let i = 89; i >= 0; i--) {
			const d = new Date(today);
			d.setDate(d.getDate() - i);
			const dateStr = d.toISOString().slice(0, 10);
			const entry = activity.find((a) => a.activity_date === dateStr);
			result.push({ date: dateStr, xp: entry?.xp_earned ?? 0 });
		}
		return result;
	}

	const days = $derived(buildDays(activity));

	// Split into weeks (columns of 7)
	const weeks = $derived.by(() => {
		const w: Array<typeof days> = [];
		for (let i = 0; i < days.length; i += 7) {
			w.push(days.slice(i, i + 7));
		}
		return w;
	});

	function xpToColor(xp: number): string {
		if (xp === 0) return 'bg-zinc-100';
		if (xp < 25)  return 'bg-emerald-200';
		if (xp < 60)  return 'bg-emerald-400';
		if (xp < 100) return 'bg-emerald-500';
		return 'bg-emerald-600';
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	const totalXpLast90 = $derived(days.reduce((s, d) => s + d.xp, 0));
	const activeDays = $derived(days.filter((d) => d.xp > 0).length);
</script>

<div class="bg-white rounded-xl border border-zinc-200 p-5">
	<div class="flex items-center justify-between mb-4">
		<div>
			<h3 class="text-sm font-semibold text-zinc-700">Activity — last 90 days</h3>
			<p class="text-xs text-zinc-400 mt-0.5">{activeDays} active days · {totalXpLast90.toLocaleString()} XP earned</p>
		</div>
		<div class="flex items-center gap-1.5 text-[10px] text-zinc-400">
			<span>Less</span>
			{#each ['bg-zinc-100','bg-emerald-200','bg-emerald-400','bg-emerald-500','bg-emerald-600'] as cls}
				<span class="w-3 h-3 rounded-sm {cls}"></span>
			{/each}
			<span>More</span>
		</div>
	</div>

	<div class="flex gap-1 overflow-x-auto pb-1" aria-label="Activity heatmap for the last 90 days">
		{#each weeks as week}
			<div class="flex flex-col gap-1">
				{#each week as day}
					<div
						class="w-3 h-3 rounded-sm {xpToColor(day.xp)} cursor-default"
						title="{formatDate(day.date)}: {day.xp} XP"
						role="img"
						aria-label="{formatDate(day.date)}: {day.xp} XP"
					></div>
				{/each}
			</div>
		{/each}
	</div>
</div>
