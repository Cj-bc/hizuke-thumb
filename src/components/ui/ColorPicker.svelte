<script lang="ts">
  interface Props {
    value?: string;
    label?: string;
    class?: string;
    onchange?: (color: string) => void;
  }

  let {
    value = $bindable('#ffffff'),
    label = '',
    class: className = '',
    onchange,
  }: Props = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    onchange?.(value);
  }

  function handleTextInput(e: Event) {
    const target = e.target as HTMLInputElement;
    let newValue = target.value;
    // # がなければ追加
    if (!newValue.startsWith('#')) {
      newValue = '#' + newValue;
    }
    // 有効な16進数カラーコードかチェック
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      value = newValue;
      onchange?.(value);
    }
  }
</script>

<div class="flex flex-col gap-1 {className}">
  {#if label}
    <label class="text-sm text-text-secondary">{label}</label>
  {/if}
  <div class="flex items-center gap-2">
    <input
      type="color"
      {value}
      oninput={handleInput}
      class="w-10 h-10 border border-border rounded cursor-pointer bg-transparent"
    />
    <input
      type="text"
      value={value}
      oninput={handleTextInput}
      class="flex-1 px-3 py-2 bg-bg-tertiary border border-border rounded text-text-primary font-mono text-sm uppercase"
      placeholder="#FFFFFF"
      maxlength="7"
    />
  </div>
</div>
