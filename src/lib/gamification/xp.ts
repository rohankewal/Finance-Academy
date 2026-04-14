// XP values for all earn-able actions. Never change these retroactively.

export const XP = {
	LESSON_COMPLETE: 50,
	QUIZ_FIRST_TRY_BONUS: 25, // total 75 if first try
	QUIZ_SECOND_TRY_BONUS: 10, // total 60 if second try
	TRACK_COMPLETE_BONUS: 100,
	CALCULATOR_FIRST_USE: 15,
	DAILY_LOGIN: 10,
	STREAK_7_BONUS: 50,
	STREAK_30_BONUS: 200,
	STREAK_100_BONUS: 500,
} as const;

/**
 * Calculates XP for a lesson completion.
 * @param quizPassed - whether the quiz was passed
 * @param quizAttempts - number of attempts (0 if lesson completed without quiz)
 */
export function calcLessonXp(quizPassed: boolean, quizAttempts: number): number {
	let xp = XP.LESSON_COMPLETE;
	if (quizPassed) {
		if (quizAttempts <= 1) xp += XP.QUIZ_FIRST_TRY_BONUS;
		else if (quizAttempts === 2) xp += XP.QUIZ_SECOND_TRY_BONUS;
		// 3+ attempts: base XP only
	}
	return xp;
}

/** Returns bonus XP for a streak milestone (0 if not a milestone). */
export function streakMilestoneXp(streak: number): number {
	if (streak === 100) return XP.STREAK_100_BONUS;
	if (streak === 30) return XP.STREAK_30_BONUS;
	if (streak === 7) return XP.STREAK_7_BONUS;
	return 0;
}
