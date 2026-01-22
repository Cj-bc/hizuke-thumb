<script lang="ts">
  import { Modal, Button } from '$components/ui';
  import DatePicker from './DatePicker.svelte';
  import { CanvasEngine } from '$lib/canvas';
  import { canvasState, layerState } from '$lib/state';
  import { downloadBlob, generateFilename } from '$lib/utils';
  import { onMount } from 'svelte';

  interface Props {
    open: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  let selectedDate = $state(new Date());
  let canvasEl: HTMLCanvasElement;
  let engine: CanvasEngine | null = null;
  let isGenerating = $state(false);

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
      date: selectedDate,
      showSelection: false,
    });
  }

  async function handleDownload() {
    if (!engine || isGenerating) return;

    isGenerating = true;

    try {
      const blob = await engine.renderToBlob(layerState.layers, {
        date: selectedDate,
        showSelection: false,
      });

      const filename = generateFilename('thumbnail_{date}.png', selectedDate);
      downloadBlob(blob, filename);

      open = false;
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('画像の生成に失敗しました');
    } finally {
      isGenerating = false;
    }
  }

  function handleClose() {
    open = false;
  }

  // プレビューのスケール計算
  const previewScale = $derived(() => {
    const maxWidth = 600;
    const maxHeight = 400;
    const scaleX = maxWidth / canvasState.width;
    const scaleY = maxHeight / canvasState.height;
    return Math.min(scaleX, scaleY, 1);
  });
</script>

<Modal {open} title="サムネイルを生成" size="xl" onclose={handleClose}>
  <div class="flex gap-6">
    <!-- プレビュー -->
    <div class="flex-1">
      <div class="bg-bg-primary rounded p-4 flex items-center justify-center">
        <canvas
          bind:this={canvasEl}
          width={canvasState.width}
          height={canvasState.height}
          class="shadow-lg"
          style="transform: scale({previewScale()}); transform-origin: center;"
        ></canvas>
      </div>
    </div>

    <!-- コントロール -->
    <div class="w-64 space-y-4">
      <div>
        <h4 class="text-sm font-medium text-text-secondary mb-2">日付を選択</h4>
        <DatePicker bind:value={selectedDate} onchange={() => renderPreview()} />
      </div>

      <div class="text-sm text-text-secondary">
        <p>ファイル名: thumbnail_{selectedDate.getFullYear()}{String(selectedDate.getMonth() + 1).padStart(2, '0')}{String(selectedDate.getDate()).padStart(2, '0')}.png</p>
        <p class="mt-1">サイズ: {canvasState.width} x {canvasState.height}</p>
      </div>

      <div class="pt-4 border-t border-border space-y-2">
        <Button
          variant="primary"
          class="w-full"
          onclick={handleDownload}
          disabled={isGenerating}
        >
          {isGenerating ? '生成中...' : 'ダウンロード'}
        </Button>
        <Button variant="ghost" class="w-full" onclick={handleClose}>
          キャンセル
        </Button>
      </div>
    </div>
  </div>
</Modal>
