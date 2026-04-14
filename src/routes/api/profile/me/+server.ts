import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals: { supabase, session } }) => {
	if (!session) throw error(401, 'Unauthorized');

	const userId = session.user.id;

	const [profileRes, completionsRes, badgesRes, activityRes] = await Promise.all([
		supabase.from('profiles').select('*').eq('id', userId).single(),
		supabase.from('lesson_completions').select('*').eq('user_id', userId).order('completed_at'),
		supabase
			.from('user_badges')
			.select('*, badges(*)')
			.eq('user_id', userId)
			.order('earned_at'),
		supabase
			.from('daily_activity')
			.select('*')
			.eq('user_id', userId)
			.order('activity_date', { ascending: false })
			.limit(90),
	]);

	return json({
		profile: profileRes.data,
		completions: completionsRes.data ?? [],
		badges: badgesRes.data ?? [],
		recentActivity: activityRes.data ?? [],
	});
};
