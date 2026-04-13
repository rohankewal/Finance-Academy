<script lang="ts">
	import '../app.css';
	import TopNav from '$lib/components/layout/TopNav.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import MobileDrawer from '$lib/components/layout/MobileDrawer.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	let mobileOpen = $state(false);

	// Determine if we're on a page that should show the sidebar
	import { page } from '$app/stores';
	const showSidebar = $derived(
		$page.url.pathname.startsWith('/learn') ||
		$page.url.pathname.startsWith('/calculators') ||
		$page.url.pathname.startsWith('/glossary'),
	);
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
		<!-- Full width layout (homepage) -->
		<main class="flex-1">
			{@render children()}
		</main>
	{/if}

	<Footer />
</div>
