import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { calcLessonXp } from '$lib/gamification/xp';
import { updateStreak } from '$lib/gamification/streaks';
import { computeNewBadges, awardBadges } from '$lib/gamification/badges';
import { getLevelForXp } from '$lib/gamification/levels';
import { TRACKS } from '$lib/data/tracks';

const TOTAL_LESSONS = TRACKS.reduce((s, t) => s + t.lessons.length, 0);
const TOTAL_CALCULATORS = 5;

export const POST: RequestHandler = async ({ request, locals: { supabase, session } }) => {
	if (!session) throw error(401, 'Unauthorized');

	const userId = session.user.id;
	const body = await request.json() as {
		trackSlug: string;
		lessonSlug: string;
		quizPassed: boolean;
		quizAttempts: number;
	};

	const { trackSlug, lessonSlug, quizPassed, quizAttempts } = body;
	if (!trackSlug || !lessonSlug) throw error(400, 'Missing trackSlug or lessonSlug');

	// 1. Check if already completed — return early if so
	const { data: existing } = await supabase
		.from('lesson_completions')
		.select('id, xp_earned')
		.eq('user_id', userId)
		.eq('track_slug', trackSlug)
		.eq('lesson_slug', lessonSlug)
		.maybeSingle();

	if (existing) {
		return json({ xpEarned: 0, newBadges: [], streakUpdated: false, levelUp: false });
	}

	// 2. Calculate XP
	const xpEarned = calcLessonXp(quizPassed, quizAttempts);

	// 3. Get current profile state
	const { data: profile } = await supabase
		.from('profiles')
		.select('total_xp, current_streak, longest_streak, last_lesson_date')
		.eq('id', userId)
		.single();

	const prevXp = profile?.total_xp ?? 0;
	const prevLevel = getLevelForXp(prevXp);

	// 4. Insert lesson_completions row
	await supabase.from('lesson_completions').insert({
		user_id: userId,
		track_slug: trackSlug,
		lesson_slug: lessonSlug,
		quiz_passed: quizPassed,
		xp_earned: xpEarned,
	});

	// 5. Upsert daily_activity
	const today = new Date().toISOString().slice(0, 10);
	await supabase
		.from('daily_activity')
		.upsert(
			{ user_id: userId, activity_date: today, xp_earned: xpEarned, lessons_completed: 1 },
			{
				onConflict: 'user_id,activity_date',
				ignoreDuplicates: false,
			},
		);

	// 6. Update streak
	const streakResult = await updateStreak(userId, supabase);
	const totalXpAfterStreak = prevXp + xpEarned + streakResult.milestoneXp;

	// 7. Update profile total_xp and last_active_at
	await supabase
		.from('profiles')
		.update({
			total_xp: totalXpAfterStreak,
			last_active_at: new Date().toISOString(),
		})
		.eq('id', userId);

	// 8. Check for new badge unlocks
	const { data: allCompletions } = await supabase
		.from('lesson_completions')
		.select('track_slug, lesson_slug, quiz_passed')
		.eq('user_id', userId);

	const { data: existingBadges } = await supabase
		.from('user_badges')
		.select('badge_slug')
		.eq('user_id', userId);

	const { data: calcUses } = await supabase
		.from('calculator_uses')
		.select('calculator_slug')
		.eq('user_id', userId);

	const completionsList = allCompletions ?? [];
	const totalLessonsCompleted = completionsList.length;

	// Determine which tracks are fully completed
	const completedTracks = TRACKS.filter((track) =>
		track.lessons.every((l) =>
			completionsList.some(
				(c: { track_slug: string; lesson_slug: string }) =>
					c.track_slug === track.slug && c.lesson_slug === l.slug,
			),
		),
	).map((t) => t.slug);

	// Count first-try quiz passes
	const firstTryQuizCount = completionsList.filter(
		(c: { quiz_passed: boolean }) => c.quiz_passed,
	).length;

	const existingBadgeSlugs = (existingBadges ?? []).map(
		(b: { badge_slug: string }) => b.badge_slug,
	);

	const newBadgeSlugs = computeNewBadges({
		totalLessonsCompleted,
		totalLessonsAvailable: TOTAL_LESSONS,
		completedTracks,
		calculatorsUsed: (calcUses ?? []).length,
		totalCalculators: TOTAL_CALCULATORS,
		currentStreak: streakResult.currentStreak,
		firstTryQuizCount,
		totalXp: totalXpAfterStreak,
		existingBadgeSlugs,
	});

	const newBadges = await awardBadges(userId, newBadgeSlugs, supabase);

	// 9. Check for track completion bonus
	const isTrackComplete = TRACKS.find((t) => t.slug === trackSlug)?.lessons.every((l) =>
		completionsList.some(
			(c: { track_slug: string; lesson_slug: string }) =>
				c.track_slug === trackSlug && c.lesson_slug === l.slug,
		),
	);

	let trackBonusXp = 0;
	if (isTrackComplete) {
		trackBonusXp = 100;
		await supabase
			.from('profiles')
			.update({ total_xp: totalXpAfterStreak + trackBonusXp })
			.eq('id', userId);
	}

	// 10. Check for level up
	const newLevel = getLevelForXp(totalXpAfterStreak + trackBonusXp);
	const levelUp = newLevel.level > prevLevel.level;

	return json({
		xpEarned: xpEarned + streakResult.milestoneXp + trackBonusXp,
		newBadges,
		streakUpdated: streakResult.didIncrease,
		streakMilestone: streakResult.milestoneReached,
		levelUp,
		newLevel: levelUp ? newLevel : null,
		currentStreak: streakResult.currentStreak,
	});
};
