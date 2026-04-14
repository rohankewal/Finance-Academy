import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Badge } from '$lib/types/database';

/** All badge slugs — kept in sync with supabase/seed.sql */
export const BADGE_SLUGS = {
	FIRST_LESSON: 'first-lesson',
	FIVE_LESSONS: 'five-lessons',
	TEN_LESSONS: 'ten-lessons',
	ALL_LESSONS: 'all-lessons',
	MONEY_BASICS: 'money-basics-complete',
	DEBT_101: 'debt-101-complete',
	INVESTING: 'investing-complete',
	CALCULATOR_CURIOUS: 'calculator-curious',
	WEEK_STREAK: 'week-streak',
	MONTH_STREAK: 'month-streak',
	HUNDRED_STREAK: 'hundred-streak',
	QUICK_LEARNER: 'quick-learner',
	FIRST_THOUSAND: 'first-thousand',
} as const;

export type BadgeSlug = (typeof BADGE_SLUGS)[keyof typeof BADGE_SLUGS];

export type BadgeCheckInput = {
	totalLessonsCompleted: number;
	totalLessonsAvailable: number;
	completedTracks: string[];
	calculatorsUsed: number;
	totalCalculators: number;
	currentStreak: number;
	firstTryQuizCount: number;
	totalXp: number;
	existingBadgeSlugs: string[];
	newBadgeSlug?: string; // a streak badge earned this request
};

/**
 * Returns the slugs of all newly earned badges given the current user state.
 * Only returns badges not already in `existingBadgeSlugs`.
 */
export function computeNewBadges(input: BadgeCheckInput): BadgeSlug[] {
	const {
		totalLessonsCompleted,
		totalLessonsAvailable,
		completedTracks,
		calculatorsUsed,
		totalCalculators,
		currentStreak,
		firstTryQuizCount,
		totalXp,
		existingBadgeSlugs,
	} = input;

	const earned: BadgeSlug[] = [];

	const has = (slug: BadgeSlug) => existingBadgeSlugs.includes(slug);
	const earn = (slug: BadgeSlug) => {
		if (!has(slug)) earned.push(slug);
	};

	if (totalLessonsCompleted >= 1) earn(BADGE_SLUGS.FIRST_LESSON);
	if (totalLessonsCompleted >= 5) earn(BADGE_SLUGS.FIVE_LESSONS);
	if (totalLessonsCompleted >= 10) earn(BADGE_SLUGS.TEN_LESSONS);
	if (totalLessonsCompleted >= totalLessonsAvailable && totalLessonsAvailable > 0) earn(BADGE_SLUGS.ALL_LESSONS);

	if (completedTracks.includes('money-basics')) earn(BADGE_SLUGS.MONEY_BASICS);
	if (completedTracks.includes('debt-101')) earn(BADGE_SLUGS.DEBT_101);
	if (completedTracks.includes('investing-fundamentals')) earn(BADGE_SLUGS.INVESTING);

	if (calculatorsUsed >= totalCalculators && totalCalculators > 0) earn(BADGE_SLUGS.CALCULATOR_CURIOUS);

	if (currentStreak >= 7) earn(BADGE_SLUGS.WEEK_STREAK);
	if (currentStreak >= 30) earn(BADGE_SLUGS.MONTH_STREAK);
	if (currentStreak >= 100) earn(BADGE_SLUGS.HUNDRED_STREAK);

	if (firstTryQuizCount >= 5) earn(BADGE_SLUGS.QUICK_LEARNER);
	if (totalXp >= 1000) earn(BADGE_SLUGS.FIRST_THOUSAND);

	return earned;
}

/** Inserts newly earned badge rows for a user, returns badge details. */
export async function awardBadges(
	userId: string,
	slugs: BadgeSlug[],
	supabase: SupabaseClient<Database>,
): Promise<Badge[]> {
	if (slugs.length === 0) return [];

	// Insert badge rows (ignore conflicts — badge may already exist from a race)
	await supabase
		.from('user_badges')
		.insert(slugs.map((badge_slug) => ({ user_id: userId, badge_slug })));

	// Fetch badge details for the response
	const { data } = await supabase
		.from('badges')
		.select('*')
		.in('slug', slugs)
		.order('display_order');

	return (data as Badge[]) ?? [];
}

/** Fetches all badge definitions (for the /badges catalog page). */
export async function getAllBadges(supabase: SupabaseClient<Database>): Promise<Badge[]> {
	const { data } = await supabase.from('badges').select('*').order('display_order');
	return (data as Badge[]) ?? [];
}
