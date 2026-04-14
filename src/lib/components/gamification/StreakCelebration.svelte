<script lang="ts">
	import type { StreakNotification } from '$lib/stores/notifications.svelte';
	import { onMount } from 'svelte';

	let {
		streak,
		onDismiss,
	}: {
		streak: StreakNotification;
		onDismiss: () => void;
	} = $props();

	onMount(async () => {
		if (typeof window === 'undefined') return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		try {
			const confetti = (await import('canvas-confetti')).default;
			confetti({ particleCount: 200, spread: 120, origin: { y: 0.4 }, zIndex: 9999 });
		} catch {
			// skip
		}
	});

	const messages: Record<number, { emoji: string; headline: string; sub: string }> = {
		7: {
			emoji: '🔥',
			headline: '7-Day Streak!',
			sub: "You've been learning every day this week. You're on fire!",
		},
		30: {
			emoji: '🚀',
			headline: '30-Day Streak!',
			sub: "One full month of daily learning. You're unstoppable.",
		},
		100: {
			emoji: '👑',
			headline: '100-Day Streak!',
			sub: "100 days of consistent learning. You are legendary.",
		},
	};

	const msg = $derived(
		messages[streak.streak] ?? {
			emoji: '🔥',
			headline: `${streak.streak}-Day Streak!`,
			sub: "You're on a roll. Keep the momentum going!",
		},
	);
</script>

<div
	class="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
	role="dialog"
	aria-modal="true"
	aria-label="Streak milestone"
>
	<div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center flex flex-col items-center gap-4 animate-pop">
		<div class="text-6xl leading-none select-none">{msg.emoji}</div>
		<div class="flex flex-col gap-1.5">
			<p class="text-xs font-semibold text-accent uppercase tracking-widest">Streak Milestone</p>
			<h2 class="text-2xl font-bold text-zinc-900">{msg.headline}</h2>
			<p class="text-sm text-zinc-500 leading-relaxed">{msg.sub}</p>
		</div>
		<button
			type="button"
			onclick={onDismiss}
			class="w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors mt-2"
		>
			Keep the streak alive →
		</button>
	</div>
</div>

<style>
	@keyframes pop {
		from { opacity: 0; transform: scale(0.85); }
		to   { opacity: 1; transform: scale(1); }
	}
	.animate-pop {
		animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}
	@media (prefers-reduced-motion: reduce) {
		.animate-pop { animation: none; }
	}
</style>
