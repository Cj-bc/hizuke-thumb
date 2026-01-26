<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
    onclick?: (e: MouseEvent) => void;
    children: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    type = 'button',
    class: className = '',
    onclick,
    children,
  }: Props = $props();

  const baseClasses = 'inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-accent text-white hover:bg-accent-hover focus:ring-accent',
    secondary: 'bg-bg-tertiary text-text-primary hover:bg-border focus:ring-border',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary focus:ring-border',
    danger: 'bg-danger text-white hover:bg-red-600 focus:ring-danger',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const computedClass = $derived(
    `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  );
</script>

<button
  {type}
  {disabled}
  class={computedClass}
  {onclick}
>
  {@render children()}
</button>
