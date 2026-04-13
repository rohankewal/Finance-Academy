import { TRACKS } from '$lib/data/tracks';

const STORAGE_KEY = 'finance-academy-progress';

class ProgressStore {
	completed = $state<Record<string, boolean>>({});

	constructor() {
		if (typeof window !== 'undefined') {
			try {
				const stored = localStorage.getItem(STORAGE_KEY);
				if (stored) {
					this.completed = JSON.parse(stored) as Record<string, boolean>;
				}
			} catch {
				// localStorage unavailable or corrupt — start fresh
			}
		}
	}

	private key(trackSlug: string, lessonSlug: string): string {
		return `${trackSlug}/${lessonSlug}`;
	}

	private persist(): void {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(this.completed));
			} catch {
				// Ignore storage errors (private browsing, quota exceeded, etc.)
			}
		}
	}

	markComplete(trackSlug: string, lessonSlug: string): void {
		this.completed = { ...this.completed, [this.key(trackSlug, lessonSlug)]: true };
		this.persist();
	}

	markIncomplete(trackSlug: string, lessonSlug: string): void {
		const next = { ...this.completed };
		delete next[this.key(trackSlug, lessonSlug)];
		this.completed = next;
		this.persist();
	}

	isComplete(trackSlug: string, lessonSlug: string): boolean {
		return !!this.completed[this.key(trackSlug, lessonSlug)];
	}

	/** Returns 0–100 representing % of lessons completed in a track */
	trackProgress(trackSlug: string): number {
		const track = TRACKS.find((t) => t.slug === trackSlug);
		if (!track || track.lessons.length === 0) return 0;
		const completed = track.lessons.filter((l) => this.isComplete(trackSlug, l.slug)).length;
		return Math.round((completed / track.lessons.length) * 100);
	}

	/** Returns 0–100 representing overall progress across all tracks */
	overallProgress(): number {
		const allLessons = TRACKS.flatMap((t) => t.lessons.map((l) => ({ track: t.slug, lesson: l.slug })));
		if (allLessons.length === 0) return 0;
		const completed = allLessons.filter((l) => this.isComplete(l.track, l.lesson)).length;
		return Math.round((completed / allLessons.length) * 100);
	}

	/** Count of completed lessons across all tracks */
	completedCount(): number {
		return Object.values(this.completed).filter(Boolean).length;
	}

	/** Total lesson count across all tracks */
	totalCount(): number {
		return TRACKS.reduce((sum, t) => sum + t.lessons.length, 0);
	}

	reset(): void {
		this.completed = {};
		this.persist();
	}
}

export const progress = new ProgressStore();
