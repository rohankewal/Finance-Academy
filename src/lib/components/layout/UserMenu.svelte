<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { getLevelForXp } from '$lib/gamification/levels';
	import { goto } from '$app/navigation';
	import { getSupabaseClient } from '$lib/supabase/client';

	let open = $state(false);

	const level = $derived(getLevelForXp(auth.totalXp));

	async function signOut() {
		open = false;
		const supabase = getSupabaseClient();
		if (supabase) await supabase.auth.signOut();
		goto('/');
	}

	function closeOnOutside(node: HTMLElement) {
		const handler = (e: MouseEvent) => {
			if (!node.contains(e.target as Node)) open = false;
		};
		document.addEventListener('click', handler, true);
		return { destroy: () => document.removeEventListener('click', handler, true) };
	}
</script>

{#if auth.isLoggedIn}
	<div class="relative" use:closeOnOutside>
		<button
			type="button"
			onclick={() => (open = !open)}
			class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
			aria-label="User menu"
			aria-expanded={open}
		>
			<span class="text-lg leading-none">{auth.avatarEmoji}</span>
			<span class="hidden sm:flex flex-col items-start leading-none gap-0.5">
				<span class="text-xs font-semibold text-zinc-800 max-w-[100px] truncate">
					{auth.displayName ?? 'You'}
				</span>
				<span class="text-[10px] text-zinc-400">Lvl {level.level} · {level.name}</span>
			</span>
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-400">
				<polyline points="6 9 12 15 18 9"></polyline>
			</svg>
		</button>

		{#if open}
			<div class="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-zinc-200 shadow-lg py-1 z-50 text-sm">
				<a href="/dashboard" onclick={() => (open = false)} class="flex items-center gap-2.5 px-4 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
					Dashboard
				</a>
				{#if auth.profile?.username}
					<a href="/profile/{auth.profile.username}" onclick={() => (open = false)} class="flex items-center gap-2.5 px-4 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
						Profile
					</a>
				{/if}
				<a href="/badges" onclick={() => (open = false)} class="flex items-center gap-2.5 px-4 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
					Badges
				</a>
				<a href="/settings" onclick={() => (open = false)} class="flex items-center gap-2.5 px-4 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
					Settings
				</a>
				<div class="my-1 border-t border-zinc-100"></div>
				<button
					type="button"
					onclick={signOut}
					class="w-full flex items-center gap-2.5 px-4 py-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
					Sign out
				</button>
			</div>
		{/if}
	</div>
{:else}
	<a
		href="/auth/signin"
		class="text-sm font-medium px-3.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
	>
		Sign in
	</a>
{/if}
