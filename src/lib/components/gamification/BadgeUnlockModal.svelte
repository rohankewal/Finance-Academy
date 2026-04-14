<script lang="ts">
	import type { Badge } from '$lib/types/database';
	import { onMount } from 'svelte';

	let {
		badge,
		onDismiss,
	}: {
		badge: Badge;
		onDismiss: () => void;
	} = $props();

	onMount(async () => {
		if (typeof window === 'undefined') return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		try {
			const confetti = (await import('canvas-confetti')).default;
			confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, zIndex: 9999 });
		} catch {
			// confetti unavailable — skip
		}
	});

	function share() {
		const text = `I just earned the "${badge.name}" badge on Finance Academy! ${badge.emoji} Learn personal finance at https://finance-academy.app`;
		navigator.clipboard.writeText(text).catch(() => {});
	}
</script>

<!-- Backdrop -->
<div
	class="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
	role="dialog"
	aria-modal="true"
	aria-label="Badge unlocked"
>
	<div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center flex flex-col items-center gap-4 animate-pop">
		<div class="text-6xl leading-none select-none">{badge.emoji}</div>
		<div class="flex flex-col gap-1.5">
			<p class="text-xs font-semibold text-primary uppercase tracking-widest">Badge Unlocked!</p>
			<h2 class="text-2xl font-bold text-zinc-900">{badge.name}</h2>
			<p class="text-sm text-zinc-500 leading-relaxed">{badge.description}</p>
		</div>
		<div class="flex gap-3 mt-2 w-full">
			<button
				type="button"
				onclick={share}
				class="flex-1 px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-sm font-medium hover:bg-zinc-50 transition-colors"
			>
				Share
			</button>
			<button
				type="button"
				onclick={onDismiss}
				class="flex-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
			>
				Awesome!
			</button>
		</div>
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
