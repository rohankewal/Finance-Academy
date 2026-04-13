import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx'],
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.svx'],
			smartypants: { dashes: 'oldschool' },
		}),
	],
	kit: {
		adapter: adapter({ runtime: 'nodejs22.x' }),
		alias: {
			'$lib': './src/lib',
		},
		prerender: {
			handleHttpError: ({ status, path }) => {
				// Ignore missing static assets during prerender
				if (status === 404 && (path.endsWith('.svg') || path.endsWith('.png') || path.endsWith('.ico'))) {
					return;
				}
				throw new Error(`${status} ${path}`);
			},
		},
	},
};

export default config;
