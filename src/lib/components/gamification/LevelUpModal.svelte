<script lang="ts">
	import type { LevelUpNotification } from '$lib/stores/notifications.svelte';
	import { onMount } from 'svelte';

	let {
		levelUp,
		onDismiss,
	}: {
		levelUp: LevelUpNotification;
		onDismiss: () => void;
	} = $props();

	onMount(async () => {
		if (typeof window === 'undefined') return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		try {
			const confetti = (await import('canvas-confetti')).default;
			confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 }, zIndex: 9999 });
		} catch {
			// skip
		}
	});
</script>

<div
	class="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
	role="dialog"
	aria-modal="true"
	aria-label="Level up"
>
	<div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center flex flex-col items-center gap-4 animate-pop">
		<div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl select-none">
			🏆
		</div>
		<div class="flex flex-col gap-1.5">
			<p class="text-xs font-semibold text-primary uppercase tracking-widest">Level Up!</p>
			<h2 class="text-2xl font-bold text-zinc-900">Level {levelUp.level}</h2>
			<p class="text-lg font-semibold text-zinc-600">{levelUp.name}</p>
			<p class="text-sm text-zinc-500 mt-1">You're making serious progress. Keep it up!</p>
		</div>
		<button
			type="button"
			onclick={onDismiss}
			class="w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors mt-2"
		>
			Keep learning →
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
