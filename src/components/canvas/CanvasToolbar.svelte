<script lang="ts">
  import { Button } from '$components/ui';
  import { canvasState, layerState, presetState } from '$lib/state';
  import { ZOOM_PRESETS } from '$lib/types';

  function handleZoomIn() {
    canvasState.zoomIn();
  }

  function handleZoomOut() {
    canvasState.zoomOut();
  }

  function handleResetZoom() {
    canvasState.resetZoom();
  }

  function handleToggleGrid() {
    canvasState.toggleGrid();
  }

  function handleToggleGuides() {
    canvasState.toggleGuides();
  }

  function handleToggleRuler() {
    canvasState.toggleRuler();
  }

  function handleToggleSnap() {
    canvasState.toggleSnapToGrid();
  }

  function setZoomPreset(zoom: number) {
    canvasState.setZoom(zoom);
  }

  // Undo/Redo（将来の実装用）
  function handleUndo() {
    console.log('Undo not implemented');
  }

  function handleRedo() {
    console.log('Redo not implemented');
  }
</script>

<div class="h-10 bg-bg-secondary border-b border-border flex items-center px-2 gap-2">
  <!-- Undo/Redo -->
  <div class="flex items-center gap-1 border-r border-border pr-2">
    <button
      onclick={handleUndo}
      class="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
      title="元に戻す (Ctrl+Z)"
      disabled
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    </button>
    <button
      onclick={handleRedo}
      class="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
      title="やり直し (Ctrl+Y)"
      disabled
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
      </svg>
    </button>
  </div>

  <!-- ズーム -->
  <div class="flex items-center gap-1 border-r border-border pr-2">
    <button
      onclick={handleZoomOut}
      class="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
      title="ズームアウト"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
      </svg>
    </button>

    <select
      value={canvasState.zoom}
      onchange={(e) => setZoomPreset(Number((e.target as HTMLSelectElement).value))}
      class="bg-bg-tertiary border border-border rounded px-2 py-1 text-xs text-text-primary"
    >
      {#each ZOOM_PRESETS as zoom}
        <option value={zoom}>{Math.round(zoom * 100)}%</option>
      {/each}
    </select>

    <button
      onclick={handleZoomIn}
      class="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
      title="ズームイン"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
      </svg>
    </button>

    <button
      onclick={handleResetZoom}
      class="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
      title="ズームリセット (100%)"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    </button>
  </div>

  <!-- 表示切り替え -->
  <div class="flex items-center gap-1">
    <button
      onclick={handleToggleGrid}
      class="p-1.5 rounded {canvasState.settings.showGrid ? 'bg-accent text-white' : 'hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'}"
      title="グリッド表示"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 9h16M4 15h16M9 4v16M15 4v16" />
      </svg>
    </button>

    <button
      onclick={handleToggleSnap}
      class="p-1.5 rounded {canvasState.settings.snapToGrid ? 'bg-accent text-white' : 'hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'}"
      title="グリッドスナップ"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </button>
  </div>
</div>
