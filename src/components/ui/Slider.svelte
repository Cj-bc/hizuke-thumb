<script lang="ts">
  interface Props {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    showValue?: boolean;
    unit?: string;
    class?: string;
    onchange?: (value: number) => void;
  }

  let {
    value = $bindable(0),
    min = 0,
    max = 100,
    step = 1,
    label = '',
    showValue = true,
    unit = '',
    class: className = '',
    onchange,
  }: Props = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = Number(target.value);
    onchange?.(value);
  }
</script>

<div class="flex flex-col gap-1 {className}">
  {#if label || showValue}
    <div class="flex items-center justify-between">
      {#if label}
        <label class="text-sm text-text-secondary">{label}</label>
      {/if}
      {#if showValue}
        <span class="text-sm text-text-secondary">{value}{unit}</span>
      {/if}
    </div>
  {/if}
  <input
    type="range"
    {value}
    {min}
    {max}
    {step}
    oninput={handleInput}
    class="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent"
  />
</div>
