<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { getLevelForXp, getNextLevel, getProgressToNextLevel } from '$lib/gamification/levels';

	const xp = $derived(auth.totalXp);
	const level = $derived(getLevelForXp(xp));
	const nextLevel = $derived(getNextLevel(xp));
	const progress = $derived(getProgressToNextLevel(xp));
	const pct = $derived(Math.round(progress * 100));
</script>

{#if auth.isLoggedIn}
	<div class="hidden lg:flex flex-col gap-0.5 min-w-[100px]" title="Level {level.level}: {level.name} — {xp} XP total">
		<div class="flex items-center justify-between text-[10px] text-zinc-500">
			<span class="font-semibold">Lvl {level.level}</span>
			{#if nextLevel}
				<span class="tabular-nums">{xp} / {nextLevel.minXp} XP</span>
			{:else}
				<span>Max level</span>
			{/if}
		</div>
		<div class="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
			<div
				class="h-full rounded-full bg-primary transition-all duration-500"
				style="width: {pct}%"
			></div>
		</div>
	</div>
{/if}
