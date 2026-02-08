<script lang="ts">
  import { Modal, Button } from '$components/ui';
  import DatePicker from './DatePicker.svelte';
  import { CanvasEngine } from '$lib/canvas';
  import { canvasState, layerState } from '$lib/state';
  import { downloadBlob, generateFilename } from '$lib/utils';

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


</script>

<Modal {open} title="サムネイルを生成" size="4xl" onclose={handleClose}>
  <div class="space-y-4">
    <!-- プレビュー -->
    <div class="bg-bg-primary rounded flex items-center justify-center">
      <canvas
        bind:this={canvasEl}
        width={canvasState.width}
        height={canvasState.height}
        class="shadow-lg w-full h-auto"
      ></canvas>
    </div>

    <!-- コントロール -->
    <div class="flex items-center gap-4 pt-2 border-t border-border">
      <div class="flex items-center gap-2">
        <h4 class="text-sm font-medium text-text-secondary">日付を選択</h4>
        <DatePicker bind:value={selectedDate} onchange={() => renderPreview()} />
      </div>

      <div class="text-sm text-text-secondary ml-auto">
        <span>ファイル名: thumbnail_{selectedDate.getFullYear()}{String(selectedDate.getMonth() + 1).padStart(2, '0')}{String(selectedDate.getDate()).padStart(2, '0')}.png</span>
        <span class="ml-2">サイズ: {canvasState.width} x {canvasState.height}</span>
      </div>

      <div class="flex gap-2">
        <Button variant="ghost" onclick={handleClose}>
          キャンセル
        </Button>
        <Button
          variant="primary"
          onclick={handleDownload}
          disabled={isGenerating}
        >
          {isGenerating ? '生成中...' : 'ダウンロード'}
        </Button>
      </div>
    </div>
  </div>
</Modal>
