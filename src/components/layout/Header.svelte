<script lang="ts">
  import { Button } from '$components/ui';
  import { presetState } from '$lib/state';
  import type { SaveStatus } from '$lib/types';

  interface Props {
    onSave?: () => void;
    onExport?: () => void;
    onImport?: () => void;
    onGenerate?: () => void;
    onOpenPresets?: () => void;
  }

  let {
    onSave,
    onExport,
    onImport,
    onGenerate,
    onOpenPresets,
  }: Props = $props();

  const saveStatusText: Record<SaveStatus, string> = {
    saved: '保存済み',
    saving: '保存中...',
    unsaved: '未保存',
  };

  const saveStatusColor: Record<SaveStatus, string> = {
    saved: 'text-success',
    saving: 'text-accent',
    unsaved: 'text-text-secondary',
  };
</script>

<header class="h-14 bg-bg-secondary border-b border-border flex items-center justify-between px-4">
  <div class="flex items-center gap-4">
    <h1 class="text-lg font-bold text-text-primary">ひづけサムネ</h1>
  </div>

  <div class="flex items-center gap-2">
    {#if presetState.hasPreset}
      <button
        onclick={onOpenPresets}
        class="px-3 py-1.5 bg-bg-tertiary hover:bg-border rounded text-text-primary text-sm flex items-center gap-2"
      >
        <span class="truncate max-w-40">{presetState.currentPresetName}</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    {:else}
      <button
        onclick={onOpenPresets}
        class="px-3 py-1.5 bg-bg-tertiary hover:bg-border rounded text-text-secondary text-sm"
      >
        プリセットを選択
      </button>
    {/if}
  </div>

  <div class="flex items-center gap-3">
    {#if presetState.hasPreset}
      <span class="text-sm {saveStatusColor[presetState.saveStatus]}">
        {saveStatusText[presetState.saveStatus]}
      </span>
    {/if}

    <Button
      variant="ghost"
      size="sm"
      onclick={onSave}
      disabled={!presetState.hasPreset}
    >
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
      </svg>
      保存
    </Button>

    <Button variant="ghost" size="sm" onclick={onExport}>
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      エクスポート
    </Button>

    <Button variant="ghost" size="sm" onclick={onImport}>
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      インポート
    </Button>

    <Button
      variant="primary"
      size="sm"
      onclick={onGenerate}
      disabled={!presetState.hasPreset}
    >
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      サムネイルを生成
    </Button>
  </div>
</header>
