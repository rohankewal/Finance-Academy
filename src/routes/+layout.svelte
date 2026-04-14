<script lang="ts">
	import '../app.css';
	import TopNav from '$lib/components/layout/TopNav.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import MobileDrawer from '$lib/components/layout/MobileDrawer.svelte';
	import XpToast from '$lib/components/gamification/XpToast.svelte';
	import BadgeUnlockModal from '$lib/components/gamification/BadgeUnlockModal.svelte';
	import LevelUpModal from '$lib/components/gamification/LevelUpModal.svelte';
	import StreakCelebration from '$lib/components/gamification/StreakCelebration.svelte';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { auth } from '$lib/stores/auth.svelte';
	import { notifications } from '$lib/stores/notifications.svelte';

	let { children }: { children: Snippet } = $props();

	let mobileOpen = $state(false);

	const showSidebar = $derived(
		$page.url.pathname.startsWith('/learn') ||
		$page.url.pathname.startsWith('/calculators') ||
		$page.url.pathname.startsWith('/glossary'),
	);

	onMount(() => {
		auth.init();
	});
</script>

<!-- Top navigation -->
<TopNav onMenuClick={() => (mobileOpen = true)} />

<!-- Mobile drawer -->
<MobileDrawer bind:open={mobileOpen} />

<!-- Page layout -->
<div class="pt-[var(--topnav-height)] min-h-screen flex flex-col">
	{#if showSidebar}
		<div class="flex flex-1">
			<!-- Desktop sidebar -->
			<aside
				class="hidden lg:flex flex-col fixed left-0 top-[var(--topnav-height)] bottom-0 w-[var(--sidebar-width)] border-r border-zinc-200 bg-zinc-50/80"
			>
				<Sidebar />
			</aside>

			<!-- Main content with sidebar offset -->
			<main class="flex-1 lg:ml-[var(--sidebar-width)] min-w-0">
				{@render children()}
			</main>
		</div>
	{:else}
		<!-- Full width layout (homepage, dashboard, etc.) -->
		<main class="flex-1">
			{@render children()}
		</main>
	{/if}

	<Footer />
</div>

<!-- Gamification notification layer (fixed, above everything) -->
<XpToast toasts={notifications.xpToasts} onDismiss={(id) => notifications.dismissXpToast(id)} />

{#if notifications.pendingBadges.length > 0}
	<BadgeUnlockModal badge={notifications.pendingBadges[0]} onDismiss={() => notifications.dismissBadge()} />
{/if}

{#if notifications.pendingLevelUp}
	<LevelUpModal levelUp={notifications.pendingLevelUp} onDismiss={() => notifications.dismissLevelUp()} />
{/if}

{#if notifications.pendingStreak}
	<StreakCelebration streak={notifications.pendingStreak} onDismiss={() => notifications.dismissStreak()} />
{/if}
