<script lang="ts">
  interface Props {
    type?: 'text' | 'number' | 'email' | 'password';
    value?: string | number;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number;
    class?: string;
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
  }

  let {
    type = 'text',
    value = $bindable(''),
    placeholder = '',
    label = '',
    disabled = false,
    min,
    max,
    step,
    class: className = '',
    oninput,
    onchange,
  }: Props = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    if (type === 'number') {
      value = target.valueAsNumber;
    } else {
      value = target.value;
    }
    oninput?.(e);
  }
</script>

<div class="flex flex-col gap-1 {className}">
  {#if label}
    <label class="text-sm text-text-secondary">{label}</label>
  {/if}
  <input
    {type}
    {value}
    {placeholder}
    {disabled}
    {min}
    {max}
    {step}
    oninput={handleInput}
    {onchange}
    class="px-3 py-2 bg-bg-tertiary border border-border rounded text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
  />
</div>
