// Database type definitions matching the Supabase schema in
// supabase/migrations/001_initial_schema.sql

export type Profile = {
	id: string;
	username: string | null;
	display_name: string | null;
	avatar_emoji: string;
	created_at: string;
	last_active_at: string;
	total_xp: number;
	current_streak: number;
	longest_streak: number;
	last_lesson_date: string | null;
	email_weekly_digest: boolean;
	show_on_leaderboard: boolean;
};

export type LessonCompletion = {
	id: string;
	user_id: string;
	track_slug: string;
	lesson_slug: string;
	completed_at: string;
	quiz_passed: boolean;
	xp_earned: number;
};

export type Badge = {
	slug: string;
	name: string;
	description: string;
	emoji: string;
	criteria_type: string;
	criteria_value: string;
	display_order: number;
};

export type UserBadge = {
	id: string;
	user_id: string;
	badge_slug: string;
	earned_at: string;
};

export type DailyActivity = {
	user_id: string;
	activity_date: string;
	xp_earned: number;
	lessons_completed: number;
};

export type CalculatorUse = {
	user_id: string;
	calculator_slug: string;
	first_used_at: string;
};

// Supabase database schema type used by createServerClient / createBrowserClient
export type Database = {
	public: {
		Tables: {
			profiles: {
				Row: Profile;
				Insert: Partial<Profile> & { id: string };
				Update: Partial<Profile>;
			};
			lesson_completions: {
				Row: LessonCompletion;
				Insert: Omit<LessonCompletion, 'id' | 'completed_at'> & { id?: string; completed_at?: string };
				Update: Partial<LessonCompletion>;
			};
			badges: {
				Row: Badge;
				Insert: Badge;
				Update: Partial<Badge>;
			};
			user_badges: {
				Row: UserBadge;
				Insert: Omit<UserBadge, 'id' | 'earned_at'> & { id?: string; earned_at?: string };
				Update: Partial<UserBadge>;
			};
			daily_activity: {
				Row: DailyActivity;
				Insert: DailyActivity;
				Update: Partial<DailyActivity>;
			};
			calculator_uses: {
				Row: CalculatorUse;
				Insert: CalculatorUse;
				Update: Partial<CalculatorUse>;
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
	};
};
