<script lang="ts">
  import Header from './Header.svelte';
  import CanvasEditor from '$components/canvas/CanvasEditor.svelte';
  import PropertiesPanel from '$components/properties/PropertiesPanel.svelte';
  import LayerPanel from '$components/properties/LayerPanel.svelte';
  import PresetSelector from '$components/presets/PresetSelector.svelte';
  import PresetSaveDialog from '$components/presets/PresetSaveDialog.svelte';
  import GenerationDialog from '$components/generation/GenerationDialog.svelte';
  import { presetState, canvasState, layerState } from '$lib/state';
  import { selectImageFile, downloadJson, selectJsonFile, readFileAsText } from '$lib/utils';
  import { onMount } from 'svelte';

  // モーダル状態
  let showPresetSelector = $state(false);
  let showSaveDialog = $state(false);
  let showGenerationDialog = $state(false);

  // 初期化
  onMount(async () => {
    await presetState.initialize();

    // デフォルトプリセットがない場合はプリセットセレクターを表示
    if (!presetState.hasPreset) {
      showPresetSelector = true;
    }
  });

  // プリセット選択ダイアログを開く
  function handleOpenPresets() {
    showPresetSelector = true;
  }

  // 保存ダイアログを開く
  function handleSave() {
    showSaveDialog = true;
  }

  // エクスポート
  async function handleExport() {
    if (!presetState.currentPreset) return;

    const exportData = {
      version: '1.0.0',
      name: presetState.currentPresetName,
      canvas: {
        width: canvasState.width,
        height: canvasState.height,
      },
      layers: layerState.layers.map(l => {
        if (l.type === 'image') {
          return { ...l, imageId: '' }; // 画像IDはエクスポートしない
        }
        return { ...l, style: { ...l.style, fontId: '' } }; // フォントIDはエクスポートしない
      }),
      requiredAssets: {
        images: layerState.layers
          .filter(l => l.type === 'image')
          .map(l => l.name),
        fonts: layerState.layers
          .filter(l => l.type === 'text')
          .map(l => l.name),
      },
    };

    downloadJson(exportData, `${presetState.currentPresetName}.json`);
  }

  // インポート
  async function handleImport() {
    const file = await selectJsonFile();
    if (!file) return;

    try {
      const text = await readFileAsText(file);
      const data = JSON.parse(text);

      // TODO: インポートダイアログを表示してアセットをアップロード
      console.log('Imported data:', data);
      alert('インポート機能は現在開発中です');
    } catch (e) {
      console.error('Failed to import:', e);
      alert('インポートに失敗しました');
    }
  }

  // 生成ダイアログを開く
  function handleGenerate() {
    showGenerationDialog = true;
  }

  // 新規プリセット作成
  async function handleCreatePreset() {
    const file = await selectImageFile();
    if (!file) return;

    await presetState.createFromImage(file);
    showPresetSelector = false;
  }

  // プリセット選択
  async function handleSelectPreset(id: string) {
    await presetState.loadPreset(id);
    showPresetSelector = false;
  }
</script>

<div class="h-screen flex flex-col bg-bg-primary">
  <Header
    onSave={handleSave}
    onExport={handleExport}
    onImport={handleImport}
    onGenerate={handleGenerate}
    onOpenPresets={handleOpenPresets}
  />

  <div class="flex-1 flex overflow-hidden">
    <!-- Canvas Editor (中央) -->
    <main class="flex-1 overflow-hidden">
      <CanvasEditor />
    </main>

    <!-- Right Sidebar -->
    <aside class="w-80 bg-bg-secondary border-l border-border flex flex-col overflow-hidden">
      <!-- Properties Panel (上部) -->
      <div class="flex-1 overflow-auto border-b border-border">
        <PropertiesPanel />
      </div>

      <!-- Layer Panel (下部) -->
      <div class="h-64 overflow-auto">
        <LayerPanel />
      </div>
    </aside>
  </div>

  <!-- Modals -->
  <PresetSelector
    bind:open={showPresetSelector}
    onSelect={handleSelectPreset}
    onCreate={handleCreatePreset}
  />

  <PresetSaveDialog
    bind:open={showSaveDialog}
  />

  <GenerationDialog
    bind:open={showGenerationDialog}
  />
</div>
