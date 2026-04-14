export const prerender = false;

import { getTrack } from '$lib/data/tracks';
import { error } from '@sveltejs/kit';

export function load({ params }: { params: { track: string } }) {
	const track = getTrack(params.track);
	if (!track) throw error(404, 'Track not found');
	return { track };
}
