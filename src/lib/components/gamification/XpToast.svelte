<script lang="ts">
	import type { XpToastItem } from '$lib/stores/notifications.svelte';

	let {
		toasts,
		onDismiss,
	}: {
		toasts: XpToastItem[];
		onDismiss: (id: string) => void;
	} = $props();
</script>

{#if toasts.length > 0}
	<div
		class="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end"
		style="pointer-events: none"
		aria-live="polite"
		aria-label="XP notifications"
	>
		{#each toasts as toast (toast.id)}
			<div
				class="flex items-center gap-2.5 px-4 py-2.5 bg-zinc-900 text-white rounded-xl shadow-lg text-sm font-medium animate-slide-up"
				style="pointer-events: auto"
			>
				<span class="text-base">✨</span>
				<span class="font-mono text-primary font-bold">+{toast.xp} XP</span>
				<span class="text-zinc-300">{toast.message}</span>
				<button
					type="button"
					onclick={() => onDismiss(toast.id)}
					class="ml-1 text-zinc-500 hover:text-zinc-300 transition-colors"
					aria-label="Dismiss"
				>
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	@keyframes slide-up {
		from { opacity: 0; transform: translateY(12px); }
		to   { opacity: 1; transform: translateY(0); }
	}
	.animate-slide-up {
		animation: slide-up 0.25s ease-out both;
	}
	@media (prefers-reduced-motion: reduce) {
		.animate-slide-up { animation: none; }
	}
</style>
