<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<footer class="border-t border-zinc-200 bg-zinc-50 mt-auto">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<!-- Brand -->
			<div class="flex flex-col gap-1">
				<a href="/" class="flex items-center gap-2 text-zinc-800 font-semibold text-sm">
					<div class="w-5 h-5 rounded bg-primary flex items-center justify-center">
						<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
							<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
							<polyline points="17 6 23 6 23 12"></polyline>
						</svg>
					</div>
					Finance Academy
				</a>
				<p class="text-xs text-zinc-500">© {currentYear} Finance Academy. Free financial education.</p>
			</div>

			<!-- Links -->
			<nav class="flex flex-wrap gap-x-5 gap-y-1.5">
				{#each [
					{ href: '/learn', label: 'Learn' },
					{ href: '/calculators', label: 'Calculators' },
					{ href: '/glossary', label: 'Glossary' },
				] as link}
					<a href={link.href} class="text-xs text-zinc-500 hover:text-zinc-800 transition-colors">
						{link.label}
					</a>
				{/each}
			</nav>
		</div>

		<!-- Disclaimer -->
		<div class="mt-4 pt-4 border-t border-zinc-200">
			<p class="text-xs text-zinc-400 leading-relaxed">
				Finance Academy is for educational purposes only and does not constitute financial advice.
				Always consult a qualified financial advisor before making investment decisions.
				Content reflects general principles and US tax law — individual situations vary.
			</p>
		</div>
	</div>
</footer>
