<script lang="ts">
	import type { Profile } from '$lib/types/database';
	import { getLevelForXp, getNextLevel, getProgressToNextLevel } from '$lib/gamification/levels';
	import { TRACKS } from '$lib/data/tracks';

	let {
		profile,
		completedCount,
	}: {
		profile: Profile;
		completedCount: number;
	} = $props();

	const totalLessons = TRACKS.reduce((s, t) => s + t.lessons.length, 0);
	const level = $derived(getLevelForXp(profile.total_xp));
	const nextLevel = $derived(getNextLevel(profile.total_xp));
	const levelPct = $derived(Math.round(getProgressToNextLevel(profile.total_xp) * 100));
</script>

<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
	<!-- XP + Level -->
	<div class="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col gap-3">
		<div class="flex items-center justify-between">
			<span class="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Level</span>
			<span class="text-xs bg-primary/8 text-primary font-semibold px-2 py-0.5 rounded-full">
				{level.level}
			</span>
		</div>
		<div>
			<p class="text-2xl font-bold text-zinc-900">{level.name}</p>
			<p class="text-sm text-zinc-500 font-mono tabular-nums mt-0.5">{profile.total_xp.toLocaleString()} XP</p>
		</div>
		{#if nextLevel}
			<div class="flex flex-col gap-1">
				<div class="flex justify-between text-[10px] text-zinc-400">
					<span>→ {nextLevel.name}</span>
					<span>{levelPct}%</span>
				</div>
				<div class="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
					<div class="h-full rounded-full bg-primary transition-all duration-500" style="width: {levelPct}%"></div>
				</div>
			</div>
		{:else}
			<p class="text-xs text-success font-medium">Max level reached 🏆</p>
		{/if}
	</div>

	<!-- Streak -->
	<div class="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col gap-2">
		<span class="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Current Streak</span>
		<div class="flex items-end gap-2">
			<span class="text-4xl leading-none">🔥</span>
			<div>
				<p class="text-3xl font-bold text-zinc-900 font-mono tabular-nums leading-none">{profile.current_streak}</p>
				<p class="text-xs text-zinc-500 mt-0.5">days</p>
			</div>
		</div>
		<p class="text-xs text-zinc-400">Longest: {profile.longest_streak} days</p>
	</div>

	<!-- Lessons -->
	<div class="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col gap-2">
		<span class="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Lessons Completed</span>
		<div>
			<p class="text-3xl font-bold text-zinc-900 font-mono tabular-nums">{completedCount}</p>
			<p class="text-xs text-zinc-500 mt-0.5">of {totalLessons} total</p>
		</div>
		<div class="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
			<div
				class="h-full rounded-full bg-emerald-500 transition-all duration-500"
				style="width: {Math.round((completedCount / totalLessons) * 100)}%"
			></div>
		</div>
	</div>

	<!-- Member since -->
	<div class="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col gap-2">
		<span class="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Member since</span>
		<div>
			<p class="text-xl font-bold text-zinc-900">
				{new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
			</p>
			<p class="text-xs text-zinc-500 mt-0.5">
				{Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000)} days ago
			</p>
		</div>
	</div>
</div>
