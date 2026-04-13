<script lang="ts">
	import Sidebar from './Sidebar.svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	function close() {
		open = false;
	}

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) close();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 lg:hidden"
		onclick={handleBackdrop}
	>
		<!-- Dim overlay -->
		<div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

		<!-- Drawer panel -->
		<div
			class="absolute left-0 top-0 bottom-0 w-[var(--sidebar-width)] max-w-[80vw] bg-white shadow-xl flex flex-col"
			role="dialog"
			aria-modal="true"
			aria-label="Navigation"
		>
			<!-- Drawer header -->
			<div class="flex items-center justify-between px-4 h-[var(--topnav-height)] border-b border-zinc-200 shrink-0">
				<a href="/" onclick={close} class="flex items-center gap-2 font-bold text-zinc-900">
					<div class="w-6 h-6 rounded bg-primary flex items-center justify-center">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
							<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
							<polyline points="17 6 23 6 23 12"></polyline>
						</svg>
					</div>
					Finance Academy
				</a>
				<button
					type="button"
					onclick={close}
					class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
					aria-label="Close navigation"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>

			<!-- Sidebar content (close on link click) -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="flex-1 overflow-y-auto" onclick={(e) => { if ((e.target as HTMLElement).tagName === 'A') close(); }}>
				<Sidebar />
			</div>
		</div>
	</div>
{/if}
