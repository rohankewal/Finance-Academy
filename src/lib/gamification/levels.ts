export type Level = {
	level: number;
	name: string;
	minXp: number;
};

export const LEVELS: Level[] = [
	{ level: 1, name: 'Beginner', minXp: 0 },
	{ level: 2, name: 'Learner', minXp: 100 },
	{ level: 3, name: 'Student', minXp: 300 },
	{ level: 4, name: 'Scholar', minXp: 600 },
	{ level: 5, name: 'Strategist', minXp: 1000 },
	{ level: 6, name: 'Planner', minXp: 1500 },
	{ level: 7, name: 'Investor', minXp: 2200 },
	{ level: 8, name: 'Analyst', minXp: 3000 },
	{ level: 9, name: 'Expert', minXp: 4000 },
	{ level: 10, name: 'Finance Master', minXp: 5500 },
];

/** Returns the current level object for a given XP total. */
export function getLevelForXp(xp: number): Level {
	for (let i = LEVELS.length - 1; i >= 0; i--) {
		if (xp >= LEVELS[i].minXp) return LEVELS[i];
	}
	return LEVELS[0];
}

/** Returns the next level, or null if max level reached. */
export function getNextLevel(xp: number): Level | null {
	const current = getLevelForXp(xp);
	const next = LEVELS.find((l) => l.level === current.level + 1);
	return next ?? null;
}

/**
 * Returns progress toward the next level as a value between 0 and 1.
 * Returns 1 if at max level.
 */
export function getProgressToNextLevel(xp: number): number {
	const current = getLevelForXp(xp);
	const next = getNextLevel(xp);
	if (!next) return 1;
	const range = next.minXp - current.minXp;
	const earned = xp - current.minXp;
	return Math.min(1, Math.max(0, earned / range));
}
