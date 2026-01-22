<script lang="ts">
  import LayerItem from '$components/layers/LayerItem.svelte';
  import { layerState, presetState, canvasState } from '$lib/state';
  import { selectImageFile, uploadImage, getImageDimensions } from '$lib/storage';
  import type { TextContent } from '$lib/types';

  async function handleAddImageLayer() {
    if (!presetState.hasPreset) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const imageRecord = await uploadImage(file);
        const dimensions = await getImageDimensions(imageRecord.id);
        if (dimensions) {
          layerState.addImageLayer(
            imageRecord.id,
            file.name.replace(/\.[^.]+$/, ''),
            dimensions.width,
            dimensions.height
          );
          presetState.triggerAutoSave();
        }
      }
    };
    input.click();
  }

  function handleAddTextLayer() {
    if (!presetState.hasPreset) return;

    const content: TextContent = { type: 'static', value: 'テキスト' };
    const layer = layerState.addTextLayer(content, 'テキスト');

    // キャンバス中央に配置
    layerState.setLayerPosition(layer.id, {
      x: canvasState.width / 2,
      y: canvasState.height / 2,
    });

    presetState.triggerAutoSave();
  }

  function handleAddDateLayer() {
    if (!presetState.hasPreset) return;

    const content: TextContent = { type: 'date', format: 'yyyy/MM/dd', locale: 'ja' };
    const layer = layerState.addTextLayer(content, '日付');

    // キャンバス中央に配置
    layerState.setLayerPosition(layer.id, {
      x: canvasState.width / 2,
      y: canvasState.height / 2,
    });

    presetState.triggerAutoSave();
  }

  function handleSelectLayer(id: string) {
    layerState.selectLayer(id);
  }

  function handleToggleVisibility(id: string) {
    layerState.toggleVisibility(id);
    presetState.triggerAutoSave();
  }

  function handleToggleLock(id: string) {
    layerState.toggleLock(id);
    presetState.triggerAutoSave();
  }

  function handleDeleteLayer(id: string) {
    if (confirm('このレイヤーを削除しますか？')) {
      layerState.removeLayer(id);
      presetState.triggerAutoSave();
    }
  }

  function handleDuplicateLayer(id: string) {
    layerState.duplicateLayer(id);
    presetState.triggerAutoSave();
  }

  // 逆順（上のレイヤーが上に表示）
  const sortedLayers = $derived(
    [...layerState.layers].sort((a, b) => b.zIndex - a.zIndex)
  );
</script>

<div class="p-2">
  <div class="flex items-center justify-between mb-2 px-2">
    <h3 class="text-sm font-semibold text-text-secondary">レイヤー</h3>
    <div class="flex gap-1">
      <button
        onclick={handleAddImageLayer}
        class="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary disabled:opacity-50"
        title="画像レイヤーを追加"
        disabled={!presetState.hasPreset}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      <button
        onclick={handleAddTextLayer}
        class="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary disabled:opacity-50"
        title="テキストレイヤーを追加"
        disabled={!presetState.hasPreset}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      </button>
      <button
        onclick={handleAddDateLayer}
        class="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary disabled:opacity-50"
        title="日付レイヤーを追加"
        disabled={!presetState.hasPreset}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  </div>

  <div class="space-y-1">
    {#each sortedLayers as layer (layer.id)}
      <LayerItem
        {layer}
        selected={layerState.selectedLayerId === layer.id}
        onselect={() => handleSelectLayer(layer.id)}
        ontogglevisibility={() => handleToggleVisibility(layer.id)}
        ontogglelock={() => handleToggleLock(layer.id)}
        ondelete={() => handleDeleteLayer(layer.id)}
        onduplicate={() => handleDuplicateLayer(layer.id)}
      />
    {/each}

    {#if sortedLayers.length === 0}
      <p class="text-text-secondary text-sm text-center py-4">
        レイヤーがありません
      </p>
    {/if}
  </div>
</div>
