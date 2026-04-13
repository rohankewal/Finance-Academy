import typography from '@tailwindcss/typography';

export default {
	content: ['./src/**/*.{html,js,svelte,ts,svx}'],
	theme: {
		extend: {
			colors: {
				primary: 'rgb(var(--color-primary) / <alpha-value>)',
				'primary-dark': 'rgb(var(--color-primary-dark) / <alpha-value>)',
				accent: 'rgb(var(--color-accent) / <alpha-value>)',
				danger: 'rgb(var(--color-danger) / <alpha-value>)',
				success: 'rgb(var(--color-success) / <alpha-value>)',
				surface: 'rgb(var(--color-surface) / <alpha-value>)',
				border: 'rgb(var(--color-border) / <alpha-value>)',
				'text-base': 'rgb(var(--color-text) / <alpha-value>)',
				'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace'],
			},
			typography: {
				DEFAULT: {
					css: {
						'--tw-prose-body': 'rgb(24 24 27)',
						'--tw-prose-headings': 'rgb(24 24 27)',
						'--tw-prose-lead': 'rgb(82 82 91)',
						'--tw-prose-links': 'rgb(5 150 105)',
						'--tw-prose-bold': 'rgb(24 24 27)',
						'--tw-prose-counters': 'rgb(82 82 91)',
						'--tw-prose-bullets': 'rgb(5 150 105)',
						'--tw-prose-hr': 'rgb(228 228 231)',
						'--tw-prose-quotes': 'rgb(24 24 27)',
						'--tw-prose-quote-borders': 'rgb(5 150 105)',
						'--tw-prose-captions': 'rgb(82 82 91)',
						'--tw-prose-code': 'rgb(24 24 27)',
						'--tw-prose-pre-code': 'rgb(228 228 231)',
						'--tw-prose-pre-bg': 'rgb(24 24 27)',
						'--tw-prose-th-borders': 'rgb(228 228 231)',
						'--tw-prose-td-borders': 'rgb(228 228 231)',
						maxWidth: '65ch',
						fontSize: '1.0625rem',
						lineHeight: '1.75',
						'h2': { fontWeight: '700', letterSpacing: '-0.025em', marginTop: '2em' },
						'h3': { fontWeight: '600', letterSpacing: '-0.015em' },
						'p': { marginTop: '1.25em', marginBottom: '1.25em' },
					},
				},
			},
		},
	},
	plugins: [typography],
};
