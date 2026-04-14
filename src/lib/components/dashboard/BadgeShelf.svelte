<script lang="ts">
	import type { Badge, UserBadge } from '$lib/types/database';

	let {
		allBadges,
		earnedBadges,
		limit,
	}: {
		allBadges: Badge[];
		earnedBadges: UserBadge[];
		limit?: number;
	} = $props();

	const earnedSlugs = $derived(new Set(earnedBadges.map((b) => b.badge_slug)));

	// Show earned first, then locked, capped at limit
	const sorted = $derived.by(() => {
		const earned = allBadges.filter((b) => earnedSlugs.has(b.slug));
		const locked = allBadges.filter((b) => !earnedSlugs.has(b.slug));
		const all = [...earned, ...locked];
		return limit ? all.slice(0, limit) : all;
	});

	let tooltip = $state<string | null>(null);
</script>

<div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
	{#each sorted as badge}
		{@const earned = earnedSlugs.has(badge.slug)}
		<button
			type="button"
			onclick={() => (tooltip = tooltip === badge.slug ? null : badge.slug)}
			class="relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all
				{earned ? 'bg-white border border-zinc-200 shadow-sm hover:shadow-md hover:-translate-y-0.5' : 'bg-zinc-50 border border-zinc-100 opacity-50 hover:opacity-70'}"
			title="{badge.name}: {badge.description}"
			aria-label="{badge.name} — {earned ? 'earned' : 'locked'}"
		>
			<span class="text-2xl leading-none {earned ? '' : 'grayscale'}">{badge.emoji}</span>
			<span class="text-[9px] font-medium text-zinc-500 text-center leading-tight truncate w-full">
				{badge.name}
			</span>
			{#if !earned}
				<span class="absolute top-1 right-1 text-[8px] text-zinc-400">🔒</span>
			{/if}
		</button>
	{/each}
</div>

{#if tooltip}
	{@const b = allBadges.find((x) => x.slug === tooltip)}
	{#if b}
		<div class="mt-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm flex items-start gap-3">
			<span class="text-2xl shrink-0">{b.emoji}</span>
			<div>
				<p class="font-semibold text-zinc-800">{b.name}
					{#if earnedSlugs.has(b.slug)}
						<span class="ml-1 text-success text-xs font-normal">✓ Earned</span>
					{:else}
						<span class="ml-1 text-zinc-400 text-xs font-normal">Locked</span>
					{/if}
				</p>
				<p class="text-zinc-500 text-xs mt-0.5">{b.description}</p>
			</div>
		</div>
	{/if}
{/if}
