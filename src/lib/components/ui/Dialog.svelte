<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title,
		children,
		onclose,
	}: {
		open?: boolean;
		title?: string;
		children?: Snippet;
		onclose?: () => void;
	} = $props();

	function close() {
		open = false;
		onclose?.();
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
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
		onclick={handleBackdrop}
	>
		<!-- Dialog panel -->
		<div
			class="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-100"
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? 'dialog-title' : undefined}
		>
			<!-- Header -->
			{#if title}
				<div class="flex items-center justify-between px-6 pt-5 pb-3 border-b border-zinc-100">
					<h2 id="dialog-title" class="text-lg font-semibold text-zinc-900">{title}</h2>
					<button
						type="button"
						onclick={close}
						class="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
						aria-label="Close"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>
			{:else}
				<button
					type="button"
					onclick={close}
					class="absolute top-3 right-3 rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors z-10"
					aria-label="Close"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			{/if}

			<!-- Content -->
			<div class="px-6 py-5">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
