<script lang="ts">
	import { progress } from '$lib/stores/progress.svelte';

	let {
		question,
		options,
		explanation,
		trackSlug = '',
		lessonSlug = '',
	}: {
		question: string;
		options: { text: string; correct: boolean }[];
		explanation: string;
		trackSlug?: string;
		lessonSlug?: string;
	} = $props();

	let selected = $state<number | null>(null);
	let revealed = $state(false);

	const isCorrect = $derived(selected !== null && options[selected]?.correct === true);

	function pick(i: number) {
		if (revealed) return;
		selected = i;
		revealed = true;

		// Auto-mark complete on correct answer
		if (options[i]?.correct && trackSlug && lessonSlug) {
			progress.markComplete(trackSlug, lessonSlug);
		}
	}

	function reset() {
		selected = null;
		revealed = false;
	}
</script>

<div class="not-prose my-8 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
	<div class="flex items-center gap-2 mb-4">
		<div class="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-accent))" stroke-width="2.5">
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="16" x2="12" y2="12"></line>
				<line x1="12" y1="8" x2="12.01" y2="8"></line>
			</svg>
		</div>
		<h3 class="font-semibold text-zinc-900 text-sm">Quick Check</h3>
	</div>

	<p class="text-sm font-medium text-zinc-800 mb-3">{question}</p>

	<div class="flex flex-col gap-2">
		{#each options as opt, i}
			<button
				type="button"
				onclick={() => pick(i)}
				disabled={revealed}
				class="w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all
					{revealed && i === selected && opt.correct
					? 'border-success/50 bg-success/8 text-success font-medium'
					: revealed && i === selected && !opt.correct
					? 'border-danger/50 bg-danger/8 text-danger'
					: revealed && opt.correct
					? 'border-success/30 bg-success/5 text-success/70'
					: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 disabled:cursor-default'}"
			>
				<div class="flex items-center gap-2.5">
					<!-- Option indicator -->
					<span
						class="shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-medium
							{revealed && i === selected && opt.correct
							? 'border-success bg-success text-white'
							: revealed && i === selected && !opt.correct
							? 'border-danger bg-danger text-white'
							: revealed && opt.correct
							? 'border-success/50 text-success/60'
							: 'border-zinc-300 text-zinc-400'}"
					>
						{#if revealed && i === selected && opt.correct}
							✓
						{:else if revealed && i === selected && !opt.correct}
							✗
						{:else if revealed && opt.correct}
							✓
						{:else}
							{String.fromCharCode(65 + i)}
						{/if}
					</span>
					{opt.text}
				</div>
			</button>
		{/each}
	</div>

	{#if revealed}
		<div class="mt-4 p-3 rounded-lg bg-zinc-50 border border-zinc-100">
			<p class="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
				{isCorrect ? '✓ Correct!' : 'Not quite—'}
			</p>
			<p class="text-sm text-zinc-700">{explanation}</p>
		</div>

		<button
			type="button"
			onclick={reset}
			class="mt-3 text-xs text-zinc-500 hover:text-zinc-700 transition-colors underline-offset-2 hover:underline"
		>
			Try again
		</button>
	{/if}
</div>
