<script lang="ts">
  import type { Layer } from '$lib/types';

  interface Props {
    layer: Layer;
    selected: boolean;
    onselect: () => void;
    ontogglevisibility: () => void;
    ontogglelock: () => void;
    ondelete: () => void;
    onduplicate: () => void;
  }

  let {
    layer,
    selected,
    onselect,
    ontogglevisibility,
    ontogglelock,
    ondelete,
    onduplicate,
  }: Props = $props();

  function getLayerIcon(type: 'image' | 'text'): string {
    if (type === 'image') {
      return 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z';
    }
    return 'M4 6h16M4 12h8m-8 6h16';
  }

  function handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    // 将来的にはコンテキストメニューを表示
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer {selected ? 'bg-accent/20 border border-accent' : 'hover:bg-bg-tertiary border border-transparent'}"
  onclick={onselect}
  oncontextmenu={handleContextMenu}
>
  <!-- レイヤータイプアイコン -->
  <svg class="w-4 h-4 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getLayerIcon(layer.type)} />
  </svg>

  <!-- レイヤー名 -->
  <span class="flex-1 text-sm text-text-primary truncate {!layer.visible ? 'opacity-50' : ''}">
    {layer.name}
  </span>

  <!-- 表示/非表示 -->
  <button
    onclick|stopPropagation={ontogglevisibility}
    class="p-1 rounded hover:bg-bg-secondary {layer.visible ? 'text-text-secondary' : 'text-text-secondary/30'}"
    title={layer.visible ? '非表示にする' : '表示する'}
  >
    {#if layer.visible}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    {:else}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    {/if}
  </button>

  <!-- ロック -->
  <button
    onclick|stopPropagation={ontogglelock}
    class="p-1 rounded hover:bg-bg-secondary {layer.locked ? 'text-accent' : 'text-text-secondary/30'}"
    title={layer.locked ? 'ロック解除' : 'ロック'}
  >
    {#if layer.locked}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    {:else}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
      </svg>
    {/if}
  </button>
</div>
