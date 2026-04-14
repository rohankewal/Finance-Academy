<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { getSupabaseClient } from '$lib/supabase/client';
	import { getLevelForXp } from '$lib/gamification/levels';
	import { TRACKS } from '$lib/data/tracks';
	import type { Profile, UserBadge, Badge, LessonCompletion } from '$lib/types/database';

	const username = $derived($page.params.username);

	let profile = $state<Profile | null>(null);
	let earnedBadges = $state<Array<UserBadge & { badges: Badge }>>([]);
	let completions = $state<LessonCompletion[]>([]);
	let loading = $state(true);
	let notFound = $state(false);

	onMount(async () => {
		const supabase = getSupabaseClient();
		if (!supabase) { loading = false; return; }

		const { data: profileData } = await supabase
			.from('profiles')
			.select('*')
			.eq('username', username)
			.single();

		if (!profileData) { notFound = true; loading = false; return; }
		profile = profileData as Profile;

		const [badgesRes, completionsRes] = await Promise.all([
			supabase.from('user_badges').select('*, badges(*)').eq('user_id', profile.id).order('earned_at'),
			supabase.from('lesson_completions').select('track_slug, lesson_slug').eq('user_id', profile.id),
		]);

		earnedBadges = (badgesRes.data ?? []) as Array<UserBadge & { badges: Badge }>;
		completions = (completionsRes.data ?? []) as LessonCompletion[];
		loading = false;
	});

	const level = $derived(profile ? getLevelForXp(profile.total_xp) : null);
	const completedTracks = $derived(
		TRACKS.filter((track) =>
			track.lessons.every((l) =>
				completions.some((c) => c.track_slug === track.slug && c.lesson_slug === l.slug),
			),
		),
	);
</script>

<svelte:head>
	<title>{profile?.display_name ?? username}'s Profile — Finance Academy</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-8">
	{#if loading}
		<div class="text-zinc-400 text-sm">Loading…</div>
	{:else if notFound}
		<div class="text-center py-16">
			<p class="text-4xl mb-3">🕵️</p>
			<h1 class="text-xl font-bold text-zinc-900">Profile not found</h1>
			<p class="text-zinc-500 mt-1 text-sm">No user with username @{username}.</p>
			<a href="/learn" class="mt-4 inline-block text-sm text-primary font-medium hover:underline">← Start learning</a>
		</div>
	{:else if profile && level}
		<!-- Profile header -->
		<div class="bg-white rounded-2xl border border-zinc-200 p-6 flex items-start gap-5 mb-6">
			<div class="text-5xl leading-none">{profile.avatar_emoji}</div>
			<div class="flex-1 min-w-0">
				<h1 class="text-xl font-bold text-zinc-900">{profile.display_name ?? username}</h1>
				<p class="text-sm text-zinc-400">@{username}</p>
				<div class="flex flex-wrap gap-3 mt-3">
					<span class="flex items-center gap-1.5 text-sm text-zinc-600">
						<span class="text-primary font-semibold">Lvl {level.level}</span>
						<span class="text-zinc-400">·</span>
						<span class="font-mono">{profile.total_xp.toLocaleString()} XP</span>
					</span>
					{#if profile.current_streak > 0}
						<span class="flex items-center gap-1 text-sm text-zinc-600">
							🔥 <span class="font-mono">{profile.current_streak}-day streak</span>
						</span>
					{/if}
					<span class="text-sm text-zinc-400">
						Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
					</span>
				</div>
			</div>
		</div>

		<!-- Stats -->
		<div class="grid grid-cols-3 gap-3 mb-6">
			<div class="bg-white rounded-xl border border-zinc-200 p-4 text-center">
				<p class="text-2xl font-bold text-zinc-900 font-mono">{completions.length}</p>
				<p class="text-xs text-zinc-500 mt-0.5">Lessons done</p>
			</div>
			<div class="bg-white rounded-xl border border-zinc-200 p-4 text-center">
				<p class="text-2xl font-bold text-zinc-900 font-mono">{earnedBadges.length}</p>
				<p class="text-xs text-zinc-500 mt-0.5">Badges earned</p>
			</div>
			<div class="bg-white rounded-xl border border-zinc-200 p-4 text-center">
				<p class="text-2xl font-bold text-zinc-900 font-mono">{completedTracks.length}</p>
				<p class="text-xs text-zinc-500 mt-0.5">Tracks complete</p>
			</div>
		</div>

		<!-- Completed tracks -->
		{#if completedTracks.length > 0}
			<div class="bg-white rounded-xl border border-zinc-200 p-5 mb-6">
				<h2 class="text-sm font-semibold text-zinc-700 mb-3">Completed tracks</h2>
				<div class="flex flex-wrap gap-2">
					{#each completedTracks as track}
						<a
							href="/certificate/{track.slug}"
							class="flex items-center gap-1.5 px-3 py-1.5 bg-success/8 text-success border border-success/20 rounded-full text-xs font-medium hover:bg-success/15 transition-colors"
						>
							✓ {track.title}
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Badges -->
		{#if earnedBadges.length > 0}
			<div class="bg-white rounded-xl border border-zinc-200 p-5">
				<h2 class="text-sm font-semibold text-zinc-700 mb-4">Badges</h2>
				<div class="grid grid-cols-4 sm:grid-cols-6 gap-3">
					{#each earnedBadges as ub}
						<div
							class="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-zinc-50 border border-zinc-100"
							title="{ub.badges.name}: {ub.badges.description}"
						>
							<span class="text-2xl leading-none">{ub.badges.emoji}</span>
							<span class="text-[9px] font-medium text-zinc-500 text-center leading-tight">{ub.badges.name}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<p class="mt-6 text-xs text-center text-zinc-400">
			This is {profile.display_name ?? username}'s Finance Academy progress 🎓
		</p>
	{/if}
</div>
