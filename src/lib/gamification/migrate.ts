/**
 * Migrates localStorage progress to the Supabase database on first sign-in.
 * Called from /auth/callback after successful code exchange.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import { XP } from './xp';

type StoredProgress = Record<string, boolean>;

/**
 * Parses localStorage progress key into an array of { track_slug, lesson_slug } pairs.
 * Keys are formatted as "track/lesson".
 */
function parseLocalProgress(raw: string): Array<{ track_slug: string; lesson_slug: string }> {
	try {
		const parsed = JSON.parse(raw) as StoredProgress;
		return Object.entries(parsed)
			.filter(([, v]) => v === true)
			.map(([key]) => {
				const [track_slug, lesson_slug] = key.split('/');
				return { track_slug, lesson_slug };
			})
			.filter((r) => r.track_slug && r.lesson_slug);
	} catch {
		return [];
	}
}

/**
 * Migrates any locally stored lesson completions into the database.
 * Safe to call multiple times — existing completions are never overwritten.
 *
 * @param userId - the authenticated user's UUID
 * @param supabase - a server-side Supabase client with the user's session
 * @param localProgressJson - raw JSON string from localStorage (read client-side, passed via request)
 */
export async function migrateLocalProgress(
	userId: string,
	supabase: SupabaseClient<Database>,
	localProgressJson: string | null,
): Promise<{ migratedCount: number; xpAwarded: number }> {
	if (!localProgressJson) return { migratedCount: 0, xpAwarded: 0 };

	const local = parseLocalProgress(localProgressJson);
	if (local.length === 0) return { migratedCount: 0, xpAwarded: 0 };

	// Fetch what's already in the DB so we only insert new entries
	const { data: existing } = await supabase
		.from('lesson_completions')
		.select('track_slug, lesson_slug')
		.eq('user_id', userId);

	const existingKeys = new Set(
		(existing ?? []).map((r: { track_slug: string; lesson_slug: string }) => `${r.track_slug}/${r.lesson_slug}`),
	);

	const toInsert = local.filter(
		(r) => !existingKeys.has(`${r.track_slug}/${r.lesson_slug}`),
	);

	if (toInsert.length === 0) return { migratedCount: 0, xpAwarded: 0 };

	// Insert with base XP only — no retroactive quiz bonuses for migrated lessons
	const rows = toInsert.map((r) => ({
		user_id: userId,
		track_slug: r.track_slug,
		lesson_slug: r.lesson_slug,
		quiz_passed: false,
		xp_earned: XP.LESSON_COMPLETE,
		completed_at: new Date().toISOString(),
	}));

	await supabase.from('lesson_completions').insert(rows);

	const xpAwarded = rows.length * XP.LESSON_COMPLETE;

	// Update total_xp on profile
	const { data: profile } = await supabase
		.from('profiles')
		.select('total_xp')
		.eq('id', userId)
		.single();
	if (profile) {
		await supabase
			.from('profiles')
			.update({ total_xp: profile.total_xp + xpAwarded })
			.eq('id', userId);
	}

	return { migratedCount: rows.length, xpAwarded };
}
