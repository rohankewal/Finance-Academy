<script lang="ts">
	let { points }: { points: string[] } = $props();
</script>

<div class="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
	<div class="flex items-center gap-2 mb-3">
		<div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
				<polyline points="20 6 9 17 4 12"></polyline>
			</svg>
		</div>
		<h3 class="font-semibold text-zinc-900 text-sm">Key Takeaways</h3>
	</div>
	<ul class="space-y-2">
		{#each points as point}
			<li class="flex items-start gap-2 text-sm text-zinc-700">
				<svg
					class="shrink-0 mt-0.5 text-primary"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
				>
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
				{point}
			</li>
		{/each}
	</ul>
</div>
