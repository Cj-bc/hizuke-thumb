<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
    onclose?: () => void;
    children: Snippet;
  }

  let {
    open = $bindable(false),
    title = '',
    size = 'md',
    onclose,
    children,
  }: Props = $props();

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }

  function close() {
    open = false;
    onclose?.();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    onclick={handleBackdropClick}
  >
    <div
      class="bg-bg-secondary border border-border rounded-lg shadow-xl w-full {sizeClasses[size]} mx-4 max-h-[90vh] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {#if title}
        <div class="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 id="modal-title" class="text-lg font-semibold text-text-primary">{title}</h2>
          <button
            onclick={close}
            class="text-text-secondary hover:text-text-primary p-1 rounded hover:bg-bg-tertiary"
            aria-label="閉じる"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      {/if}
      <div class="p-4 overflow-auto">
        {@render children()}
      </div>
    </div>
  </div>
{/if}
