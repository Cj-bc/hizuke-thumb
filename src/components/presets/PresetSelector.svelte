<script lang="ts">
  import { Modal, Button } from '$components/ui';
  import PresetCard from './PresetCard.svelte';
  import { presetState } from '$lib/state';

  interface Props {
    open: boolean;
    onSelect: (id: string) => void;
    onCreate: () => void;
  }

  let {
    open = $bindable(false),
    onSelect,
    onCreate,
  }: Props = $props();

  async function handleDelete(id: string) {
    if (confirm('このプリセットを削除しますか？')) {
      await presetState.deletePreset(id);
    }
  }

  async function handleDuplicate(id: string) {
    await presetState.duplicatePreset(id);
  }

  async function handleSetDefault(id: string) {
    await presetState.setDefault(id);
  }
</script>

<Modal {open} title="プリセットを選択" size="xl" onclose={() => open = false}>
  <div class="min-h-[400px]">
    <div class="grid grid-cols-3 gap-4">
      <!-- 新規作成カード -->
      <button
        class="aspect-video bg-bg-tertiary border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-accent hover:bg-bg-tertiary/80 transition-colors"
        onclick={onCreate}
      >
        <svg class="w-12 h-12 text-text-secondary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="text-text-secondary">新規作成</span>
      </button>

      <!-- プリセット一覧 -->
      {#each presetState.presets as preset (preset.id)}
        <PresetCard
          {preset}
          onselect={() => onSelect(preset.id)}
          ondelete={() => handleDelete(preset.id)}
          onduplicate={() => handleDuplicate(preset.id)}
          onsetdefault={() => handleSetDefault(preset.id)}
        />
      {/each}
    </div>

    {#if presetState.presets.length === 0}
      <div class="text-center py-8 text-text-secondary">
        <p>プリセットがありません。</p>
        <p>「新規作成」から作成してください。</p>
      </div>
    {/if}
  </div>
</Modal>
