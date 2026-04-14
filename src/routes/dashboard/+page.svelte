<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth.svelte';
	import { getSupabaseClient } from '$lib/supabase/client';
	import ProgressOverview from '$lib/components/dashboard/ProgressOverview.svelte';
	import TrackProgress from '$lib/components/dashboard/TrackProgress.svelte';
	import ActivityHeatmap from '$lib/components/dashboard/ActivityHeatmap.svelte';
	import BadgeShelf from '$lib/components/dashboard/BadgeShelf.svelte';
	import NextUpCard from '$lib/components/dashboard/NextUpCard.svelte';
	import type { Profile, LessonCompletion, UserBadge, DailyActivity, Badge } from '$lib/types/database';

	let profile = $state<Profile | null>(null);
	let completions = $state<LessonCompletion[]>([]);
	let earnedBadges = $state<UserBadge[]>([]);
	let allBadges = $state<Badge[]>([]);
	let activity = $state<DailyActivity[]>([]);
	let loading = $state(true);

	function greeting(): string {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 17) return 'Good afternoon';
		return 'Good evening';
	}

	onMount(async () => {
		if (!auth.isLoggedIn) {
			goto('/auth/signin?redirectTo=/dashboard');
			return;
		}

		const supabase = getSupabaseClient();
		if (!supabase || !auth.user) { loading = false; return; }

		const userId = auth.user.id;
		const [profileRes, completionsRes, badgesRes, allBadgesRes, activityRes] = await Promise.all([
			supabase.from('profiles').select('*').eq('id', userId).single(),
			supabase.from('lesson_completions').select('*').eq('user_id', userId).order('completed_at'),
			supabase.from('user_badges').select('*').eq('user_id', userId).order('earned_at'),
			supabase.from('badges').select('*').order('display_order'),
			supabase.from('daily_activity').select('*').eq('user_id', userId).order('activity_date', { ascending: false }).limit(90),
		]);

		profile = profileRes.data as Profile | null;
		completions = (completionsRes.data ?? []) as LessonCompletion[];
		earnedBadges = (badgesRes.data ?? []) as UserBadge[];
		allBadges = (allBadgesRes.data ?? []) as Badge[];
		activity = (activityRes.data ?? []) as DailyActivity[];
		loading = false;
	});
</script>

<svelte:head>
	<title>Dashboard — Finance Academy</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
	{#if loading}
		<div class="flex items-center justify-center h-64">
			<div class="text-zinc-400 text-sm">Loading…</div>
		</div>
	{:else if profile}
		<!-- Greeting -->
		<div class="mb-8">
			<h1 class="text-2xl sm:text-3xl font-bold text-zinc-900">
				{greeting()}, {auth.displayName ?? 'there'} 👋
			</h1>
			<p class="text-zinc-500 mt-1 text-sm">
				{#if profile.current_streak > 1}
					You're on a <strong class="text-zinc-700">{profile.current_streak}-day streak</strong>. Keep it going!
				{:else}
					Welcome back. Pick up where you left off.
				{/if}
			</p>
		</div>

		<!-- Progress overview -->
		<section class="mb-8">
			<ProgressOverview {profile} completedCount={completions.length} />
		</section>

		<!-- Next up -->
		<section class="mb-8">
			<NextUpCard {completions} />
		</section>

		<!-- Track progress -->
		<section class="mb-8">
			<h2 class="text-lg font-bold text-zinc-900 mb-4">Your tracks</h2>
			<TrackProgress {completions} />
		</section>

		<!-- Activity heatmap -->
		<section class="mb-8">
			<ActivityHeatmap {activity} />
		</section>

		<!-- Badge shelf -->
		<section>
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-bold text-zinc-900">Badges</h2>
				<a href="/badges" class="text-sm text-primary font-medium hover:text-primary-dark transition-colors">
					View all →
				</a>
			</div>
			<div class="bg-white rounded-xl border border-zinc-200 p-5">
				<BadgeShelf {allBadges} {earnedBadges} limit={16} />
			</div>
		</section>
	{:else}
		<div class="text-center py-16">
			<p class="text-zinc-500">Could not load your dashboard. Please try refreshing.</p>
		</div>
	{/if}
</div>
