<script lang="ts">
  import { onMount } from 'svelte';
  import CanvasToolbar from './CanvasToolbar.svelte';
  import { CanvasEngine } from '$lib/canvas';
  import { canvasState, layerState, presetState } from '$lib/state';
  import { selectImageFile } from '$lib/utils';

  let containerEl: HTMLDivElement;
  let canvasEl = $state<HTMLCanvasElement>(null!);
  let engine: CanvasEngine;

  // ドラッグ状態
  let isDragging = $state(false);
  let dragStart = $state<{ x: number; y: number; layerX: number; layerY: number } | null>(null);

  // 現在の日付（プレビュー用）
  let previewDate = $state(new Date());

  // Canvas初期化
  onMount(() => {
    engine = new CanvasEngine(canvasEl);
    requestAnimationFrame(renderLoop);
  });

  // レンダリングループ
  function renderLoop() {
    if (engine && presetState.hasPreset && canvasState.baseImageId) {
      engine.setSize(canvasState.width, canvasState.height);
      engine.setBaseImage(canvasState.baseImageId);
      engine.preloadLayerImages(layerState.layers).then(() => {
        engine.render(layerState.layers, {
          date: previewDate,
          showSelection: true,
          selectedLayerId: layerState.selectedLayerId,
        });
      });
    }
    requestAnimationFrame(renderLoop);
  }

  // マウス座標をCanvas座標に変換
  function getCanvasCoords(e: MouseEvent): { x: number; y: number } {
    const rect = canvasEl.getBoundingClientRect();
    const scaleX = canvasState.width / rect.width;
    const scaleY = canvasState.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  // レイヤーのヒットテスト
  function hitTestLayer(x: number, y: number): string | null {
    // sortedLayersDesc（降順ソート済み）をフィルタリング
    const hitTestLayers = layerState.sortedLayersDesc.filter(l => l.visible && !l.locked);

    for (const layer of hitTestLayers) {
      if (layer.type === 'image') {
        if (
          x >= layer.position.x &&
          x <= layer.position.x + layer.size.width &&
          y >= layer.position.y &&
          y <= layer.position.y + layer.size.height
        ) {
          return layer.id;
        }
      } else if (layer.type === 'text') {
        // テキストはおおよその範囲でチェック
        const textWidth = layer.style.fontSize * 10; // 暫定
        const textHeight = layer.style.fontSize * layer.style.lineHeight;

        let checkX = layer.position.x;
        if (layer.style.align === 'center') {
          checkX -= textWidth / 2;
        } else if (layer.style.align === 'right') {
          checkX -= textWidth;
        }

        if (
          x >= checkX &&
          x <= checkX + textWidth &&
          y >= layer.position.y &&
          y <= layer.position.y + textHeight
        ) {
          return layer.id;
        }
      }
    }

    return null;
  }

  // マウスダウン
  function handleMouseDown(e: MouseEvent) {
    if (e.button !== 0) return; // 左クリックのみ

    const coords = getCanvasCoords(e);
    const hitLayerId = hitTestLayer(coords.x, coords.y);

    if (hitLayerId) {
      layerState.selectLayer(hitLayerId);
      const layer = layerState.selectedLayer;
      if (layer && !layer.locked) {
        isDragging = true;
        dragStart = {
          x: coords.x,
          y: coords.y,
          layerX: layer.position.x,
          layerY: layer.position.y,
        };
      }
    } else {
      layerState.selectLayer(null);
    }
  }

  // マウス移動
  function handleMouseMove(e: MouseEvent) {
    if (!isDragging || !dragStart || !layerState.selectedLayerId) return;

    const coords = getCanvasCoords(e);
    const deltaX = coords.x - dragStart.x;
    const deltaY = coords.y - dragStart.y;

    let newX = dragStart.layerX + deltaX;
    let newY = dragStart.layerY + deltaY;

    // スナップ
    const snapped = canvasState.snapPosition({ x: newX, y: newY });
    newX = snapped.x;
    newY = snapped.y;

    layerState.setLayerPosition(layerState.selectedLayerId, { x: newX, y: newY });
    presetState.triggerAutoSave();
  }

  // マウスアップ
  function handleMouseUp() {
    isDragging = false;
    dragStart = null;
  }

  // キー操作
  function handleKeyDown(e: KeyboardEvent) {
    if (!layerState.selectedLayerId) return;

    const layer = layerState.selectedLayer;
    if (!layer || layer.locked) return;

    const step = e.shiftKey ? 10 : 1;
    let moved = false;

    switch (e.key) {
      case 'ArrowUp':
        layerState.moveLayer(layer.id, { x: 0, y: -step });
        moved = true;
        break;
      case 'ArrowDown':
        layerState.moveLayer(layer.id, { x: 0, y: step });
        moved = true;
        break;
      case 'ArrowLeft':
        layerState.moveLayer(layer.id, { x: -step, y: 0 });
        moved = true;
        break;
      case 'ArrowRight':
        layerState.moveLayer(layer.id, { x: step, y: 0 });
        moved = true;
        break;
      case 'Delete':
      case 'Backspace':
        layerState.removeLayer(layer.id);
        presetState.triggerAutoSave();
        e.preventDefault();
        break;
    }

    if (moved) {
      e.preventDefault();
      presetState.triggerAutoSave();
    }
  }

  // ドラッグ&ドロップでベース画像をアップロード
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      presetState.createFromImage(file);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
  }

  // ベース画像がない場合のアップロード
  async function handleUploadBaseImage() {
    const file = await selectImageFile();
    if (file) {
      await presetState.createFromImage(file);
    }
  }

  // ズーム計算
  const canvasStyle = $derived(() => {
    const zoom = canvasState.zoom;
    const containerWidth = containerEl?.clientWidth ?? 800;
    const containerHeight = containerEl?.clientHeight ?? 600;

    // コンテナに合わせてスケール
    const scaleX = (containerWidth - 40) / canvasState.width;
    const scaleY = (containerHeight - 40) / canvasState.height;
    const fitScale = Math.min(scaleX, scaleY, 1);

    const scale = fitScale * zoom;

    return `transform: scale(${scale}); transform-origin: center;`;
  });
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="flex flex-col h-full">
  <CanvasToolbar />

  <div
    bind:this={containerEl}
    class="flex-1 overflow-auto flex items-center justify-center bg-bg-primary p-5"
    ondrop={handleDrop}
    ondragover={handleDragOver}
    role="application"
    tabindex="0"
  >
    {#if presetState.hasPreset && canvasState.baseImageId}
      <!-- Canvas -->
      <div class="relative" style={canvasStyle()}>
        <canvas
          bind:this={canvasEl}
          width={canvasState.width}
          height={canvasState.height}
          class="shadow-lg cursor-crosshair"
          onmousedown={handleMouseDown}
          onmousemove={handleMouseMove}
          onmouseup={handleMouseUp}
          onmouseleave={handleMouseUp}
        ></canvas>

        <!-- グリッド表示 -->
        {#if canvasState.settings.showGrid}
          <div
            class="absolute inset-0 pointer-events-none"
            style="
              background-size: {canvasState.settings.gridSize}px {canvasState.settings.gridSize}px;
              background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
            "
          ></div>
        {/if}
      </div>
    {:else}
      <!-- 空の状態 -->
      <div class="text-center">
        <div class="w-24 h-24 mx-auto mb-4 rounded-lg bg-bg-tertiary flex items-center justify-center">
          <svg class="w-12 h-12 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-text-secondary mb-4">ベース画像をアップロードしてください</p>
        <button
          onclick={handleUploadBaseImage}
          class="px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover"
        >
          画像をアップロード
        </button>
        <p class="text-text-secondary text-sm mt-2">または画像をドラッグ&ドロップ</p>
      </div>
    {/if}
  </div>

  <!-- ステータスバー -->
  <div class="h-6 bg-bg-secondary border-t border-border flex items-center px-4 text-xs text-text-secondary">
    <span class="mr-4">{canvasState.width} x {canvasState.height}</span>
    <span class="mr-4">ズーム: {Math.round(canvasState.zoom * 100)}%</span>
    {#if layerState.selectedLayer}
      <span>選択: {layerState.selectedLayer.name}</span>
    {/if}
  </div>
</div>
