<script lang="ts">
	import { getSupabaseClient } from '$lib/supabase/client';
	import { auth } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';

	const AVATAR_OPTIONS = [
		'🎓','💰','📈','🦁','🚀','⚡','🌱','🏆',
		'🔥','💡','🎯','🌟','🐉','🦋','🌊','🏄',
		'🎸','🍀','🦅','🌈','💎','🧠','🌙','⭐',
	];

	let step = $state(1);
	let displayName = $state(auth.profile?.display_name ?? '');
	let selectedEmoji = $state(auth.profile?.avatar_emoji ?? '🎓');
	let saving = $state(false);
	let error = $state('');

	async function saveAndFinish() {
		saving = true;
		error = '';
		const supabase = getSupabaseClient();
		if (!supabase || !auth.user) { saving = false; return; }

		const { error: err } = await supabase
			.from('profiles')
			.update({
				display_name: displayName.trim() || null,
				avatar_emoji: selectedEmoji,
			})
			.eq('id', auth.user.id);

		if (err) {
			error = err.message;
			saving = false;
			return;
		}

		await auth.refreshProfile();
		step = 3;
		saving = false;
	}
</script>

<div class="max-w-md mx-auto">
	<!-- Progress dots -->
	<div class="flex items-center justify-center gap-2 mb-8">
		{#each [1, 2, 3] as s}
			<div
				class="rounded-full transition-all duration-300
					{s === step ? 'w-6 h-2 bg-primary' : s < step ? 'w-2 h-2 bg-primary/40' : 'w-2 h-2 bg-zinc-200'}"
			></div>
		{/each}
	</div>

	{#if step === 1}
		<div class="flex flex-col gap-5">
			<div class="text-center">
				<h2 class="text-2xl font-bold text-zinc-900">What should we call you?</h2>
				<p class="text-sm text-zinc-500 mt-1">This is your display name — you can change it later.</p>
			</div>
			<input
				type="text"
				bind:value={displayName}
				placeholder="Your name (optional)"
				maxlength="50"
				class="px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-zinc-400 text-center text-lg font-medium"
			/>
			<button
				type="button"
				onclick={() => (step = 2)}
				class="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
			>
				{displayName.trim() ? 'Continue' : 'Skip'}
			</button>
		</div>

	{:else if step === 2}
		<div class="flex flex-col gap-5">
			<div class="text-center">
				<h2 class="text-2xl font-bold text-zinc-900">Pick your avatar</h2>
				<p class="text-sm text-zinc-500 mt-1">Choose an emoji to represent you on your public profile.</p>
			</div>
			<div class="grid grid-cols-6 gap-2">
				{#each AVATAR_OPTIONS as emoji}
					<button
						type="button"
						onclick={() => (selectedEmoji = emoji)}
						class="aspect-square rounded-xl text-2xl flex items-center justify-center transition-all border-2
							{selectedEmoji === emoji ? 'border-primary bg-primary/8 scale-110' : 'border-transparent bg-zinc-50 hover:bg-zinc-100'}"
						aria-label="Select {emoji}"
					>
						{emoji}
					</button>
				{/each}
			</div>
			{#if error}
				<p class="text-sm text-danger bg-danger/5 border border-danger/15 rounded-lg px-3 py-2">{error}</p>
			{/if}
			<button
				type="button"
				onclick={saveAndFinish}
				disabled={saving}
				class="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
			>
				{saving ? 'Saving…' : 'Continue'}
			</button>
		</div>

	{:else}
		<div class="flex flex-col items-center gap-5 text-center">
			<div class="text-6xl">{selectedEmoji}</div>
			<div>
				<h2 class="text-2xl font-bold text-zinc-900">You're all set{displayName.trim() ? `, ${displayName.trim()}` : ''}!</h2>
				<p class="text-sm text-zinc-500 mt-2 leading-relaxed">
					Your progress syncs across devices. Complete lessons to earn XP, badges, and streaks.
				</p>
			</div>
			<div class="flex flex-col gap-2 w-full">
				<button
					type="button"
					onclick={() => goto('/learn')}
					class="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
				>
					Start learning →
				</button>
				<button
					type="button"
					onclick={() => goto('/dashboard')}
					class="w-full py-2 rounded-xl border border-zinc-200 text-zinc-700 text-sm font-medium hover:bg-zinc-50 transition-colors"
				>
					View dashboard
				</button>
			</div>
		</div>
	{/if}
</div>
