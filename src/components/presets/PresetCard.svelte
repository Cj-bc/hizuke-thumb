<script lang="ts">
  import type { PresetRecord } from '$lib/types';

  interface Props {
    preset: PresetRecord;
    onselect: () => void;
    ondelete: () => void;
    onduplicate: () => void;
    onsetdefault: () => void;
  }

  let {
    preset,
    onselect,
    ondelete,
    onduplicate,
    onsetdefault,
  }: Props = $props();

  let showMenu = $state(false);

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function handleMenuClick(e: MouseEvent) {
    e.stopPropagation();
    showMenu = !showMenu;
  }

  function handleAction(action: () => void) {
    showMenu = false;
    action();
  }
</script>

<div
  class="relative bg-bg-tertiary rounded-lg overflow-hidden border border-border hover:border-accent transition-colors cursor-pointer group"
  onclick={onselect}
  onkeydown={(e) => e.key === 'Enter' && onselect()}
  tabindex="0"
  role="button"
>
  <!-- サムネイル -->
  <div class="aspect-video bg-bg-secondary flex items-center justify-center">
    <svg class="w-12 h-12 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>

  <!-- 情報 -->
  <div class="p-3">
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-medium text-text-primary truncate">{preset.name}</h4>
        <p class="text-xs text-text-secondary mt-1">{formatDate(preset.updatedAt)}</p>
      </div>

      <!-- メニューボタン -->
      <div class="relative">
        <button
          class="p-1 rounded hover:bg-bg-secondary text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
          onclick={handleMenuClick}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {#if showMenu}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="absolute right-0 top-full mt-1 bg-bg-secondary border border-border rounded shadow-lg z-10 py-1 min-w-32"
            onclick|stopPropagation={() => {}}
          >
            <button
              class="w-full px-3 py-1.5 text-left text-sm text-text-primary hover:bg-bg-tertiary"
              onclick={() => handleAction(onduplicate)}
            >
              複製
            </button>
            <button
              class="w-full px-3 py-1.5 text-left text-sm text-text-primary hover:bg-bg-tertiary"
              onclick={() => handleAction(onsetdefault)}
            >
              {preset.isDefault ? 'デフォルト解除' : 'デフォルトに設定'}
            </button>
            <hr class="my-1 border-border" />
            <button
              class="w-full px-3 py-1.5 text-left text-sm text-danger hover:bg-bg-tertiary"
              onclick={() => handleAction(ondelete)}
            >
              削除
            </button>
          </div>
        {/if}
      </div>
    </div>

    {#if preset.isDefault}
      <span class="inline-block mt-2 px-2 py-0.5 bg-accent/20 text-accent text-xs rounded">
        デフォルト
      </span>
    {/if}
  </div>
</div>

<svelte:window onclick={() => showMenu = false} />
