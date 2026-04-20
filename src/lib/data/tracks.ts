export type Lesson = {
	slug: string;
	title: string;
	description: string;
	estimatedMinutes: number;
};

export type Track = {
	slug: string;
	title: string;
	description: string;
	icon: string;
	accent: 'emerald' | 'amber' | 'blue';
	lessons: Lesson[];
};

export const TRACKS: Track[] = [
	{
		slug: 'money-basics',
		title: 'Money Basics',
		description: 'Start here. Learn how money, banking, and budgeting actually work.',
		icon: 'Wallet',
		accent: 'emerald',
		lessons: [
			{
				slug: 'what-is-money',
				title: 'What Is Money, Really?',
				description: 'Understand what money is, where it comes from, and why it has value — beyond just "the government says so."',
				estimatedMinutes: 5,
			},
			{
				slug: 'budgeting-basics',
				title: 'Budgeting Basics',
				description: 'Build a budget that actually works for your life — not a spreadsheet you abandon after two weeks.',
				estimatedMinutes: 7,
			},
			{
				slug: 'emergency-funds',
				title: 'Why You Need an Emergency Fund',
				description: 'The financial safety net that turns "I\'m ruined" moments into "okay, I got this" moments.',
				estimatedMinutes: 6,
			},
			{
				slug: 'credit-scores',
				title: 'How Credit Scores Work',
				description: 'Demystify the three-digit number that affects your rent, car loan, and more — and learn how to improve it.',
				estimatedMinutes: 8,
			},
			{
				slug: 'checking-vs-savings-accounts',
				title: 'Checking vs. Savings Accounts',
				description: 'Two accounts, two jobs — learn which one holds your spending money and which one quietly grows it.',
				estimatedMinutes: 7,
			},
		],
	},
	{
		slug: 'debt-101',
		title: 'Debt 101',
		description: 'Understand credit cards, loans, and how to not get crushed by them.',
		icon: 'CreditCard',
		accent: 'amber',
		lessons: [
			{
				slug: 'good-vs-bad-debt',
				title: 'Good Debt vs. Bad Debt',
				description: 'Not all debt is equal. Learn which borrowing can build wealth and which drains it.',
				estimatedMinutes: 6,
			},
			{
				slug: 'credit-cards-explained',
				title: 'How Credit Cards Actually Work',
				description: 'Grace periods, interest calculations, minimum payments — understand the mechanics before they cost you.',
				estimatedMinutes: 8,
			},
			{
				slug: 'student-loans',
				title: 'Student Loans Demystified',
				description: 'Federal vs. private, income-driven repayment, forgiveness programs — a clear map through the maze.',
				estimatedMinutes: 10,
			},
		],
	},
	{
		slug: 'investing-fundamentals',
		title: 'Investing Fundamentals',
		description: 'From compound interest to index funds. Build lifelong wealth.',
		icon: 'TrendingUp',
		accent: 'emerald',
		lessons: [
			{
				slug: 'why-invest',
				title: 'Why Investing Matters',
				description: 'Why keeping money in a savings account is actually losing money — and what to do instead.',
				estimatedMinutes: 5,
			},
			{
				slug: 'compound-interest',
				title: 'Compound Interest: The 8th Wonder',
				description: 'Learn how your money can make money, and why starting early matters more than anything.',
				estimatedMinutes: 7,
			},
			{
				slug: 'stocks-vs-bonds',
				title: 'Stocks vs. Bonds',
				description: 'The two building blocks of almost every investment portfolio — what they are and how they behave differently.',
				estimatedMinutes: 8,
			},
			{
				slug: 'index-funds',
				title: 'Why Index Funds Win',
				description: 'The investment strategy that beats most professional fund managers — and costs almost nothing.',
				estimatedMinutes: 9,
			},
		],
	},
];

/** Returns flat array of all lessons with their track context */
export function getAllLessons(): Array<Lesson & { track: Track; index: number }> {
	return TRACKS.flatMap((track) =>
		track.lessons.map((lesson, index) => ({ ...lesson, track, index })),
	);
}

/** Find a track by slug */
export function getTrack(slug: string): Track | undefined {
	return TRACKS.find((t) => t.slug === slug);
}

/** Find a lesson within a track */
export function getLesson(trackSlug: string, lessonSlug: string): Lesson | undefined {
	return getTrack(trackSlug)?.lessons.find((l) => l.slug === lessonSlug);
}

/** Get prev/next lesson links for navigation */
export function getLessonNeighbors(
	trackSlug: string,
	lessonSlug: string,
): {
	prev: (Lesson & { trackSlug: string }) | null;
	next: (Lesson & { trackSlug: string }) | null;
} {
	const all = getAllLessons();
	const idx = all.findIndex((l) => l.track.slug === trackSlug && l.slug === lessonSlug);

	const prev = idx > 0 ? { ...all[idx - 1], trackSlug: all[idx - 1].track.slug } : null;
	const next = idx < all.length - 1 ? { ...all[idx + 1], trackSlug: all[idx + 1].track.slug } : null;

	return { prev, next };
}
