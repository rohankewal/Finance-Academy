import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import { streakMilestoneXp } from './xp';

export type StreakUpdateResult = {
	currentStreak: number;
	longestStreak: number;
	didIncrease: boolean;
	milestoneReached: number | null; // 7, 30, 100 or null
	milestoneXp: number;
};

/** Returns today's date string in YYYY-MM-DD format (UTC). */
export function todayUTC(): string {
	return new Date().toISOString().slice(0, 10);
}

/** Returns yesterday's date string in YYYY-MM-DD format (UTC). */
export function yesterdayUTC(): string {
	const d = new Date();
	d.setUTCDate(d.getUTCDate() - 1);
	return d.toISOString().slice(0, 10);
}

/**
 * Updates streak for a user after any qualifying activity.
 * Rules:
 *   - same day as last_lesson_date → no change
 *   - consecutive day → increment
 *   - gap of ≥1 day → reset to 1
 *   - longest_streak never decreases
 */
export async function updateStreak(
	userId: string,
	supabase: SupabaseClient<Database>,
): Promise<StreakUpdateResult> {
	const today = todayUTC();
	const yesterday = yesterdayUTC();

	const { data: profile, error } = await supabase
		.from('profiles')
		.select('current_streak, longest_streak, last_lesson_date')
		.eq('id', userId)
		.single();

	if (error || !profile) {
		return { currentStreak: 1, longestStreak: 1, didIncrease: false, milestoneReached: null, milestoneXp: 0 };
	}

	const lastDate = profile.last_lesson_date;
	let currentStreak = profile.current_streak;
	let longestStreak = profile.longest_streak;
	let didIncrease = false;
	let milestoneReached: number | null = null;

	if (lastDate === today) {
		// Already counted today — no change
	} else if (lastDate === yesterday) {
		// Consecutive day — increment
		currentStreak = currentStreak + 1;
		didIncrease = true;
	} else {
		// Gap — reset to 1
		currentStreak = 1;
		didIncrease = lastDate === null; // first ever activity counts as "increased" for badge check
	}

	if (currentStreak > longestStreak) {
		longestStreak = currentStreak;
	}

	// Check for streak milestones
	if (didIncrease && [7, 30, 100].includes(currentStreak)) {
		milestoneReached = currentStreak;
	}

	const milestoneXp = milestoneReached ? streakMilestoneXp(milestoneReached) : 0;

	// Persist updates
	await supabase
		.from('profiles')
		.update({
			current_streak: currentStreak,
			longest_streak: longestStreak,
			last_lesson_date: today,
			last_active_at: new Date().toISOString(),
		})
		.eq('id', userId);

	return { currentStreak, longestStreak, didIncrease, milestoneReached, milestoneXp };
}
