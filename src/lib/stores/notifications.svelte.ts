import type { Badge } from '$lib/types/database';

export type XpToastItem = {
	id: string;
	xp: number;
	message: string;
};

export type BadgeNotification = Badge;

export type LevelUpNotification = {
	level: number;
	name: string;
};

export type StreakNotification = {
	streak: number;
};

class NotificationStore {
	xpToasts = $state<XpToastItem[]>([]);
	pendingBadges = $state<BadgeNotification[]>([]);
	pendingLevelUp = $state<LevelUpNotification | null>(null);
	pendingStreak = $state<StreakNotification | null>(null);

	addXpToast(xp: number, message: string) {
		const id = crypto.randomUUID();
		this.xpToasts = [...this.xpToasts, { id, xp, message }];
		// Auto-dismiss after 3 seconds
		setTimeout(() => this.dismissXpToast(id), 3000);
	}

	dismissXpToast(id: string) {
		this.xpToasts = this.xpToasts.filter((t) => t.id !== id);
	}

	queueBadge(badge: BadgeNotification) {
		this.pendingBadges = [...this.pendingBadges, badge];
	}

	dismissBadge() {
		this.pendingBadges = this.pendingBadges.slice(1);
	}

	queueLevelUp(level: number, name: string) {
		this.pendingLevelUp = { level, name };
	}

	dismissLevelUp() {
		this.pendingLevelUp = null;
	}

	queueStreak(streak: number) {
		this.pendingStreak = { streak };
	}

	dismissStreak() {
		this.pendingStreak = null;
	}
}

export const notifications = new NotificationStore();
