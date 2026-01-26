<script lang="ts">
  interface Props {
    checked?: boolean;
    label?: string;
    disabled?: boolean;
    class?: string;
    onchange?: (checked: boolean) => void;
  }

  let {
    checked = $bindable(false),
    label = '',
    disabled = false,
    class: className = '',
    onchange,
  }: Props = $props();

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    checked = target.checked;
    onchange?.(checked);
  }
</script>

<label class="flex items-center gap-2 cursor-pointer {disabled ? 'opacity-50 cursor-not-allowed' : ''} {className}">
  <input
    type="checkbox"
    {checked}
    {disabled}
    onchange={handleChange}
    class="w-4 h-4 rounded border-border bg-bg-tertiary text-accent focus:ring-accent focus:ring-offset-bg-primary cursor-pointer disabled:cursor-not-allowed"
  />
  {#if label}
    <span class="text-sm text-text-primary">{label}</span>
  {/if}
</label>
