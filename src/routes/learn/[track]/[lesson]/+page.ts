import { error } from '@sveltejs/kit';
import { getTrack, getLesson, getLessonNeighbors } from '$lib/data/tracks';
import type { PageLoad } from './$types';
import type { Component } from 'svelte';

// Eagerly import all lesson modules so Vite can statically analyze them
const modules = import.meta.glob('/src/lib/content/lessons/**/*.svx');

export const prerender = true;

export const load: PageLoad = async ({ params }) => {
	const { track: trackSlug, lesson: lessonSlug } = params;

	const track = getTrack(trackSlug);
	if (!track) error(404, `Track "${trackSlug}" not found`);

	const lesson = getLesson(trackSlug, lessonSlug);
	if (!lesson) error(404, `Lesson "${lessonSlug}" not found`);

	// Try exact slug path first, then prefixed numeric variant
	let moduleFn = modules[`/src/lib/content/lessons/${trackSlug}/${lessonSlug}.svx`];

	if (!moduleFn) {
		// Try prefixed filenames (01-slug.svx, 02-slug.svx, etc.)
		const prefixedKey = Object.keys(modules).find((k) => {
			const filename = k.split('/').pop() ?? '';
			return filename.replace(/^\d+-/, '') === `${lessonSlug}.svx`;
		});
		if (prefixedKey) moduleFn = modules[prefixedKey];
	}

	if (!moduleFn) {
		error(404, `Lesson content for "${lessonSlug}" not found`);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const mod = (await moduleFn()) as { default: Component<any>; metadata?: Record<string, unknown> };
	const { prev, next } = getLessonNeighbors(trackSlug, lessonSlug);

	return {
		Component: mod.default,
		metadata: mod.metadata ?? {},
		track,
		lesson,
		prev,
		next,
	};
};
