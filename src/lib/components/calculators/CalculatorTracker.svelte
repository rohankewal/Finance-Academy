<script lang="ts">
	/**
	 * Drop this component into any calculator page.
	 * On first mount, if the user is logged in, it fires POST /api/calculators/use
	 * and shows an XP toast if it's their first time using that calculator.
	 */
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { notifications } from '$lib/stores/notifications.svelte';
	import type { Badge } from '$lib/types/database';

	let { slug }: { slug: string } = $props();

	onMount(async () => {
		if (!auth.isLoggedIn) return;

		try {
			const res = await fetch('/api/calculators/use', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ calculatorSlug: slug }),
			});
			if (!res.ok) return;

			const data = await res.json() as {
				xpEarned: number;
				firstUse: boolean;
				newBadges: Badge[];
			};

			if (data.firstUse && data.xpEarned > 0) {
				notifications.addXpToast(data.xpEarned, 'First calculator used!');
			}
			for (const badge of data.newBadges) {
				notifications.queueBadge(badge);
			}
			if (data.firstUse) {
				await auth.refreshProfile();
			}
		} catch {
			// silent fail
		}
	});
</script>
