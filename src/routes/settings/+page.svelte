<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth.svelte';
	import { getSupabaseClient } from '$lib/supabase/client';

	const AVATAR_OPTIONS = [
		'🎓','💰','📈','🦁','🚀','⚡','🌱','🏆',
		'🔥','💡','🎯','🌟','🐉','🦋','🌊','🏄',
		'🎸','🍀','🦅','🌈','💎','🧠','🌙','⭐',
	];

	let displayName = $state('');
	let username = $state('');
	let selectedEmoji = $state('🎓');
	let emailDigest = $state(true);
	let showOnLeaderboard = $state(false);
	let saving = $state(false);
	let saveMsg = $state('');
	let showDeleteConfirm = $state(false);

	onMount(async () => {
		if (!auth.isLoggedIn) { goto('/auth/signin'); return; }
		if (auth.profile) {
			displayName = auth.profile.display_name ?? '';
			username = auth.profile.username ?? '';
			selectedEmoji = auth.profile.avatar_emoji ?? '🎓';
			emailDigest = auth.profile.email_weekly_digest;
			showOnLeaderboard = auth.profile.show_on_leaderboard;
		}
	});

	async function save(e: SubmitEvent) {
		e.preventDefault();
		saving = true;
		saveMsg = '';
		const supabase = getSupabaseClient();
		if (!supabase || !auth.user) { saving = false; return; }

		type ProfileUpdate = {
			display_name: string | null;
			avatar_emoji: string;
			email_weekly_digest: boolean;
			show_on_leaderboard: boolean;
			username?: string;
		};
		const updates: ProfileUpdate = {
			display_name: displayName.trim() || null,
			avatar_emoji: selectedEmoji,
			email_weekly_digest: emailDigest,
			show_on_leaderboard: showOnLeaderboard,
		};
		if (username.trim()) updates.username = username.trim().toLowerCase();

		const { error } = await supabase.from('profiles').update(updates as never).eq('id', auth.user.id);
		if (error) {
			saveMsg = error.message.includes('unique') ? 'That username is already taken.' : error.message;
		} else {
			await auth.refreshProfile();
			saveMsg = 'Saved!';
			setTimeout(() => (saveMsg = ''), 2000);
		}
		saving = false;
	}

	async function deleteAccount() {
		const supabase = getSupabaseClient();
		if (!supabase || !auth.user) return;
		// Sign out first, then the user should contact support or we can use admin API
		await supabase.auth.signOut();
		goto('/');
	}
</script>

<svelte:head>
	<title>Settings — Finance Academy</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-8">
	<h1 class="text-2xl font-bold text-zinc-900 mb-6">Settings</h1>

	<form onsubmit={save} class="flex flex-col gap-6">
		<!-- Profile -->
		<div class="bg-white rounded-xl border border-zinc-200 p-6 flex flex-col gap-5">
			<h2 class="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Profile</h2>

			<div class="flex flex-col gap-1.5">
				<label for="display-name" class="text-sm font-medium text-zinc-700">Display name</label>
				<input
					id="display-name"
					type="text"
					bind:value={displayName}
					placeholder="Your name"
					maxlength="50"
					class="px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
				/>
			</div>

			<div class="flex flex-col gap-1.5">
				<label for="username" class="text-sm font-medium text-zinc-700">Username <span class="text-zinc-400 font-normal">(for public profile URL)</span></label>
				<div class="relative">
					<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400">@</span>
					<input
						id="username"
						type="text"
						bind:value={username}
						placeholder="yourname"
						maxlength="30"
						pattern="[a-zA-Z0-9_-]+"
						class="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
			</div>

			<div class="flex flex-col gap-2">
				<p class="text-sm font-medium text-zinc-700">Avatar</p>
				<div class="grid grid-cols-8 gap-2">
					{#each AVATAR_OPTIONS as emoji}
						<button
							type="button"
							onclick={() => (selectedEmoji = emoji)}
							class="aspect-square rounded-lg text-xl flex items-center justify-center transition-all border-2
								{selectedEmoji === emoji ? 'border-primary bg-primary/8 scale-105' : 'border-transparent bg-zinc-50 hover:bg-zinc-100'}"
							aria-label="Select {emoji}"
						>
							{emoji}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Notifications -->
		<div class="bg-white rounded-xl border border-zinc-200 p-6 flex flex-col gap-4">
			<h2 class="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Preferences</h2>

			<div class="flex items-center justify-between gap-4">
				<div>
					<p class="text-sm font-medium text-zinc-700">Weekly digest email</p>
					<p class="text-xs text-zinc-400 mt-0.5">A weekly summary of your progress and streak.</p>
				</div>
				<button
					type="button"
					role="switch"
					aria-checked={emailDigest}
					aria-label="Toggle weekly digest email"
					onclick={() => (emailDigest = !emailDigest)}
					class="relative w-10 h-6 rounded-full transition-colors {emailDigest ? 'bg-primary' : 'bg-zinc-200'}"
				>
					<span
						class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
							{emailDigest ? 'translate-x-5' : 'translate-x-1'}"
					></span>
				</button>
			</div>

			<div class="flex items-center justify-between gap-4">
				<div>
					<p class="text-sm font-medium text-zinc-700">Show on leaderboard</p>
					<p class="text-xs text-zinc-400 mt-0.5">Appear on the top learners leaderboard.</p>
				</div>
				<button
					type="button"
					role="switch"
					aria-checked={showOnLeaderboard}
					aria-label="Toggle show on leaderboard"
					onclick={() => (showOnLeaderboard = !showOnLeaderboard)}
					class="relative w-10 h-6 rounded-full transition-colors {showOnLeaderboard ? 'bg-primary' : 'bg-zinc-200'}"
				>
					<span
						class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
							{showOnLeaderboard ? 'translate-x-5' : 'translate-x-1'}"
					></span>
				</button>
			</div>
		</div>

		{#if saveMsg}
			<p class="text-sm font-medium {saveMsg === 'Saved!' ? 'text-success' : 'text-danger'}">{saveMsg}</p>
		{/if}

		<button
			type="submit"
			disabled={saving}
			class="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 w-fit"
		>
			{saving ? 'Saving…' : 'Save changes'}
		</button>
	</form>

	<!-- Danger zone -->
	<div class="mt-10 border-t border-zinc-200 pt-6">
		<h2 class="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">Danger zone</h2>
		{#if !showDeleteConfirm}
			<button
				type="button"
				onclick={() => (showDeleteConfirm = true)}
				class="px-4 py-2 rounded-xl border border-danger/30 text-danger text-sm font-medium hover:bg-danger/5 transition-colors"
			>
				Delete account
			</button>
		{:else}
			<div class="bg-danger/5 border border-danger/20 rounded-xl p-4 flex flex-col gap-3">
				<p class="text-sm font-medium text-danger">Are you sure? This cannot be undone.</p>
				<p class="text-xs text-zinc-500">Your profile, progress, badges, and XP will be permanently deleted.</p>
				<div class="flex gap-2">
					<button
						type="button"
						onclick={deleteAccount}
						class="px-4 py-2 rounded-xl bg-danger text-white text-sm font-semibold hover:bg-danger/90 transition-colors"
					>
						Yes, delete my account
					</button>
					<button
						type="button"
						onclick={() => (showDeleteConfirm = false)}
						class="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50 transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
