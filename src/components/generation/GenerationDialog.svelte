<script lang="ts">
  import { Modal, Button } from '$components/ui';
  import DatePicker from './DatePicker.svelte';
  import DateRangePicker from './DateRangePicker.svelte';
  import { CanvasEngine } from '$lib/canvas';
  import { canvasState, layerState, presetState } from '$lib/state';
  import { downloadBlob, generateFilename, downloadImagesAsZip } from '$lib/utils';
  import { resolveTextContent } from '$lib/canvas/TextRenderer';
  import type { TextLayer } from '$lib/types';
  import { onMount } from 'svelte';

  interface Props {
    open: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  type Mode = 'single' | 'multiple';
  let mode = $state<Mode>('single');

  let selectedDate = $state(new Date());
  let selectedDates = $state<Date[]>([]);
  let currentPreviewIndex = $state(0);

  let canvasEl: HTMLCanvasElement;
  let engine: CanvasEngine | null = null;
  let isGenerating = $state(false);
  let progress = $state(0);

  // 日付テキストを含むレイヤー一覧
  const dateTextLayers = $derived(() => {
    return layerState.layers.filter(
      (layer): layer is TextLayer => layer.type === 'text' && layer.content.type === 'date'
    );
  });

  // 現在プレビュー中の日付
  const currentPreviewDate = $derived(() => {
    if (mode === 'single') {
      return selectedDate;
    }
    return selectedDates[currentPreviewIndex] ?? new Date();
  });

  $effect(() => {
    if (open && canvasEl && canvasState.baseImageId) {
      engine = new CanvasEngine(canvasEl);
      engine.setSize(canvasState.width, canvasState.height);
      engine.setBaseImage(canvasState.baseImageId);
      renderPreview();
    }
  });

  $effect(() => {
    if (open && engine) {
      renderPreview();
    }
  });

  async function renderPreview() {
    if (!engine) return;

    await engine.preloadLayerImages(layerState.layers);
    await engine.render(layerState.layers, {
      date: currentPreviewDate(),
      showSelection: false,
    });
  }

  async function handleDownload() {
    if (!engine || isGenerating) return;

    isGenerating = true;
    progress = 0;

    try {
      if (mode === 'single') {
        // 単一日付のダウンロード
        const blob = await engine.renderToBlob(layerState.layers, {
          date: selectedDate,
          showSelection: false,
        });

        const filename = generateFilename('thumbnail_{date}.png', selectedDate, presetState.currentPreset?.name);
        downloadBlob(blob, filename);
      } else {
        // 複数日付のダウンロード
        if (selectedDates.length === 0) {
          alert('日付を選択してください');
          return;
        }

        const images: { date: Date; blob: Blob }[] = [];

        for (let i = 0; i < selectedDates.length; i++) {
          const date = selectedDates[i];
          progress = Math.round(((i + 1) / selectedDates.length) * 100);

          const blob = await engine.renderToBlob(layerState.layers, {
            date,
            showSelection: false,
          });

          images.push({ date, blob });
        }

        await downloadImagesAsZip(images, 'thumbnail_{date}.png', presetState.currentPreset?.name);
      }

      open = false;
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('画像の生成に失敗しました');
    } finally {
      isGenerating = false;
      progress = 0;
    }
  }

  function handleClose() {
    open = false;
  }

  function previousDate() {
    if (currentPreviewIndex > 0) {
      currentPreviewIndex--;
    }
  }

  function nextDate() {
    if (currentPreviewIndex < selectedDates.length - 1) {
      currentPreviewIndex++;
    }
  }

  function removeDate(dateToRemove: Date) {
    selectedDates = selectedDates.filter(d => d.getTime() !== dateToRemove.getTime());
    if (currentPreviewIndex >= selectedDates.length) {
      currentPreviewIndex = Math.max(0, selectedDates.length - 1);
    }
  }

  // 日付変更時にプレビューを更新
  function handleDateChange() {
    renderPreview();
  }

  function handleDatesChange(dates: Date[]) {
    selectedDates = dates;
    currentPreviewIndex = 0;
    renderPreview();
  }

  // プレビューのスケール計算
  const previewScale = $derived(() => {
    const maxWidth = 500;
    const maxHeight = 350;
    const scaleX = maxWidth / canvasState.width;
    const scaleY = maxHeight / canvasState.height;
    return Math.min(scaleX, scaleY, 1);
  });

  // ダウンロードボタンのラベル
  const downloadButtonLabel = $derived(() => {
    if (isGenerating) {
      return mode === 'multiple' ? `生成中... ${progress}%` : '生成中...';
    }
    if (mode === 'multiple' && selectedDates.length > 1) {
      return `${selectedDates.length}件をダウンロード`;
    }
    return 'ダウンロード';
  });
</script>

<Modal {open} title="サムネイルを生成" size="xl" onclose={handleClose}>
  <div class="flex gap-6">
    <!-- プレビューエリア -->
    <div class="flex-1">
      <div class="bg-bg-primary rounded p-4 flex flex-col items-center justify-center min-h-[400px]">
        <canvas
          bind:this={canvasEl}
          width={canvasState.width}
          height={canvasState.height}
          class="shadow-lg"
          style="transform: scale({previewScale()}); transform-origin: center;"
        ></canvas>

        <!-- 複数日付時のナビゲーション -->
        {#if mode === 'multiple' && selectedDates.length > 1}
          <div class="flex items-center gap-4 mt-4">
            <button
              class="px-3 py-1 bg-bg-tertiary hover:bg-border rounded disabled:opacity-50"
              onclick={previousDate}
              disabled={currentPreviewIndex === 0}
            >
              ← 前
            </button>
            <span class="text-text-secondary">
              {currentPreviewIndex + 1} / {selectedDates.length}
            </span>
            <button
              class="px-3 py-1 bg-bg-tertiary hover:bg-border rounded disabled:opacity-50"
              onclick={nextDate}
              disabled={currentPreviewIndex >= selectedDates.length - 1}
            >
              次 →
            </button>
          </div>
        {/if}
      </div>
    </div>

    <!-- コントロールエリア -->
    <div class="w-80 space-y-4 max-h-[500px] overflow-y-auto">
      <!-- モード切り替え -->
      <div class="flex gap-2">
        <button
          class="flex-1 px-3 py-2 rounded text-sm font-medium transition-colors
            {mode === 'single' ? 'bg-accent text-white' : 'bg-bg-tertiary text-text-secondary hover:bg-border'}"
          onclick={() => { mode = 'single'; renderPreview(); }}
        >
          単一日付
        </button>
        <button
          class="flex-1 px-3 py-2 rounded text-sm font-medium transition-colors
            {mode === 'multiple' ? 'bg-accent text-white' : 'bg-bg-tertiary text-text-secondary hover:bg-border'}"
          onclick={() => { mode = 'multiple'; renderPreview(); }}
        >
          複数日付
        </button>
      </div>

      <!-- 日付選択UI -->
      {#if mode === 'single'}
        <div>
          <h4 class="text-sm font-medium text-text-secondary mb-2">日付を選択</h4>
          <DatePicker bind:value={selectedDate} onchange={handleDateChange} />
        </div>
      {:else}
        <div>
          <h4 class="text-sm font-medium text-text-secondary mb-2">複数の日付を選択</h4>
          <DateRangePicker bind:selectedDates={selectedDates} onchange={handleDatesChange} />
        </div>

        <!-- 選択された日付のリスト -->
        {#if selectedDates.length > 0}
          <div>
            <h4 class="text-sm font-medium text-text-secondary mb-2">選択中の日付</h4>
            <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {#each selectedDates as date, i}
                <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-bg-tertiary rounded text-sm
                  {i === currentPreviewIndex ? 'ring-1 ring-accent' : ''}">
                  {date.getMonth() + 1}/{date.getDate()}
                  <button
                    class="text-text-secondary hover:text-danger"
                    onclick={() => removeDate(date)}
                  >
                    ×
                  </button>
                </span>
              {/each}
            </div>
          </div>
        {/if}
      {/if}

      <!-- 動的テキストレイヤーのプレビュー -->
      {#if dateTextLayers().length > 0}
        <div class="border-t border-border pt-4">
          <h4 class="text-sm font-medium text-text-secondary mb-2">日付テキストプレビュー</h4>
          <div class="space-y-2">
            {#each dateTextLayers() as layer}
              <div class="p-2 bg-bg-tertiary rounded">
                <p class="text-xs text-text-secondary">{layer.name}</p>
                <p class="text-sm font-medium">
                  {resolveTextContent(layer.content, currentPreviewDate())}
                </p>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- ファイル情報 -->
      <div class="text-sm text-text-secondary border-t border-border pt-4">
        {#if mode === 'single'}
          <p>ファイル名: {generateFilename('thumbnail_{date}.png', selectedDate)}</p>
        {:else if selectedDates.length > 0}
          <p>出力形式: ZIP（{selectedDates.length}個のPNGファイル）</p>
        {/if}
        <p class="mt-1">サイズ: {canvasState.width} x {canvasState.height}</p>
      </div>

      <!-- 進捗バー（複数生成時） -->
      {#if isGenerating && mode === 'multiple'}
        <div class="w-full bg-bg-tertiary rounded h-2">
          <div class="bg-accent h-2 rounded transition-all" style="width: {progress}%"></div>
        </div>
      {/if}

      <!-- アクションボタン -->
      <div class="pt-4 border-t border-border space-y-2">
        <Button
          variant="primary"
          class="w-full"
          onclick={handleDownload}
          disabled={isGenerating || (mode === 'multiple' && selectedDates.length === 0)}
        >
          {downloadButtonLabel()}
        </Button>
        <Button variant="ghost" class="w-full" onclick={handleClose}>
          キャンセル
        </Button>
      </div>
    </div>
  </div>
</Modal>
