import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '$lib/types/database';
import { getSupabaseClient } from '$lib/supabase/client';

class AuthStore {
	session = $state<Session | null>(null);
	user = $state<User | null>(null);
	profile = $state<Profile | null>(null);
	loading = $state(true);

	/** Initialize auth state and subscribe to changes. Call once in root +layout.svelte. */
	async init() {
		const supabase = getSupabaseClient();
		if (!supabase) {
			this.loading = false;
			return;
		}

		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			this.session = session;
			this.user = session?.user ?? null;

			if (this.user) {
				await this.loadProfile();
			}
		} catch {
			// Supabase not configured — auth features disabled
		}

		this.loading = false;

		// Subscribe to auth state changes
		supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
			this.session = session;
			this.user = session?.user ?? null;
			if (this.user) {
				await this.loadProfile();
			} else {
				this.profile = null;
			}
		});
	}

	async loadProfile() {
		const supabase = getSupabaseClient();
		if (!supabase || !this.user) return;
		const { data } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', this.user.id)
			.single();
		this.profile = data as Profile | null;
	}

	async refreshProfile() {
		await this.loadProfile();
	}

	get isLoggedIn() {
		return !!this.user;
	}

	get displayName() {
		return this.profile?.display_name ?? this.user?.email?.split('@')[0] ?? null;
	}

	get avatarEmoji() {
		return this.profile?.avatar_emoji ?? '🎓';
	}

	get totalXp() {
		return this.profile?.total_xp ?? 0;
	}

	get currentStreak() {
		return this.profile?.current_streak ?? 0;
	}
}

export const auth = new AuthStore();
