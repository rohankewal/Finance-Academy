<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg';

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		type = 'button',
		href,
		class: className = '',
		onclick,
		children,
	}: {
		variant?: Variant;
		size?: Size;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		href?: string;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
	} = $props();

	const base =
		'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

	const variants: Record<Variant, string> = {
		primary:
			'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark shadow-sm',
		secondary:
			'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100 shadow-sm',
		ghost: 'text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200',
		danger: 'bg-danger text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
	};

	const sizes: Record<Size, string> = {
		sm: 'text-sm px-3 py-1.5 gap-1.5',
		md: 'text-sm px-4 py-2 gap-2',
		lg: 'text-base px-5 py-2.5 gap-2',
	};

	const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
</script>

{#if href}
	<a {href} class={classes} aria-disabled={disabled}>
		{@render children?.()}
	</a>
{:else}
	<button {type} {disabled} class={classes} {onclick}>
		{@render children?.()}
	</button>
{/if}
