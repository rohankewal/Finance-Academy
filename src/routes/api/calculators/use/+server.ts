import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { computeNewBadges, awardBadges } from '$lib/gamification/badges';
import { XP } from '$lib/gamification/xp';

const TOTAL_CALCULATORS = 5;

export const POST: RequestHandler = async ({ request, locals: { supabase, session } }) => {
	if (!session) throw error(401, 'Unauthorized');

	const userId = session.user.id;
	const body = await request.json() as { calculatorSlug: string };
	const { calculatorSlug } = body;
	if (!calculatorSlug) throw error(400, 'Missing calculatorSlug');

	// Check if this is the first use for this calculator
	const { data: existing } = await supabase
		.from('calculator_uses')
		.select('calculator_slug')
		.eq('user_id', userId)
		.eq('calculator_slug', calculatorSlug)
		.maybeSingle();

	if (existing) {
		return json({ xpEarned: 0, firstUse: false, newBadges: [] });
	}

	// First use — record it
	await supabase.from('calculator_uses').insert({ user_id: userId, calculator_slug: calculatorSlug });

	// Award XP
	const xpEarned = XP.CALCULATOR_FIRST_USE;
	const { data: profile } = await supabase
		.from('profiles')
		.select('total_xp')
		.eq('id', userId)
		.single();

	const newTotalXp = (profile?.total_xp ?? 0) + xpEarned;
	await supabase.from('profiles').update({ total_xp: newTotalXp }).eq('id', userId);

	// Check for badge (calculator curious)
	const { data: allUses } = await supabase
		.from('calculator_uses')
		.select('calculator_slug')
		.eq('user_id', userId);

	const { data: existingBadges } = await supabase
		.from('user_badges')
		.select('badge_slug')
		.eq('user_id', userId);

	const existingBadgeSlugs = (existingBadges ?? []).map((b: { badge_slug: string }) => b.badge_slug);

	const newBadgeSlugs = computeNewBadges({
		totalLessonsCompleted: 0,
		totalLessonsAvailable: 11,
		completedTracks: [],
		calculatorsUsed: (allUses ?? []).length,
		totalCalculators: TOTAL_CALCULATORS,
		currentStreak: 0,
		firstTryQuizCount: 0,
		totalXp: newTotalXp,
		existingBadgeSlugs,
	});

	const newBadges = await awardBadges(userId, newBadgeSlugs, supabase);

	return json({ xpEarned, firstUse: true, newBadges });
};
