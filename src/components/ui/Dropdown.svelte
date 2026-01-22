<script lang="ts">
  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    value?: string;
    options: Option[];
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    class?: string;
    onchange?: (value: string) => void;
  }

  let {
    value = $bindable(''),
    options,
    label = '',
    placeholder = '選択してください',
    disabled = false,
    class: className = '',
    onchange,
  }: Props = $props();

  function handleChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    value = target.value;
    onchange?.(value);
  }
</script>

<div class="flex flex-col gap-1 {className}">
  {#if label}
    <label class="text-sm text-text-secondary">{label}</label>
  {/if}
  <select
    {value}
    {disabled}
    onchange={handleChange}
    class="px-3 py-2 bg-bg-tertiary border border-border rounded text-text-primary focus:border-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
  >
    {#if placeholder}
      <option value="" disabled>{placeholder}</option>
    {/if}
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
</div>
