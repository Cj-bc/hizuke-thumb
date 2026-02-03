import type { PresetRecord, SaveStatus } from '$lib/types';
import {
  getPreset,
  getAllPresets,
  getDefaultPreset,
  createNewPreset,
  savePreset,
  deletePreset as deletePresetFromDb,
  duplicatePreset as duplicatePresetInDb,
  setDefaultPreset as setDefaultPresetInDb,
  updatePresetName,
  uploadImage,
  getImageDimensions,
  registerFontsForPreset,
} from '$lib/storage';
import { layerState } from './layers.svelte';
import { canvasState } from './canvas.svelte';

class PresetState {
  // 現在のプリセット
  currentPreset = $state<PresetRecord | null>(null);

  // プリセット一覧
  presets = $state<PresetRecord[]>([]);

  // 保存状態
  saveStatus = $state<SaveStatus>('saved');

  // 自動保存タイマー
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private autoSaveDelay = 1000; // 1秒後に自動保存

  // 派生状態
  currentPresetId = $derived(this.currentPreset?.id ?? null);
  currentPresetName = $derived(this.currentPreset?.name ?? '');
  hasPreset = $derived(this.currentPreset !== null);
  isDefault = $derived(this.currentPreset?.isDefault ?? false);

  // 初期化
  async initialize() {
    await this.loadPresetList();

    // デフォルトプリセットを読み込み
    const defaultPreset = await getDefaultPreset();
    if (defaultPreset) {
      await this.loadPreset(defaultPreset.id);
    }
  }

  // プリセット一覧読み込み
  async loadPresetList() {
    this.presets = await getAllPresets();
  }

  // プリセット読み込み
  async loadPreset(id: string) {
    const preset = await getPreset(id);
    if (!preset) return false;

    this.currentPreset = preset;

    // キャンバス状態を設定
    canvasState.setSize(preset.canvas.width, preset.canvas.height);
    canvasState.setBaseImage(preset.canvas.baseImageId);

    // レイヤー状態を設定
    layerState.setLayers(preset.layers);

    // フォントを登録
    const fontIds = preset.layers
      .filter(l => l.type === 'text')
      .map(l => (l as { style: { fontId: string } }).style.fontId)
      .filter(Boolean);
    await registerFontsForPreset(fontIds);

    this.saveStatus = 'saved';
    return true;
  }

  // 新規プリセット作成（ベース画像から）
  async createFromImage(file: File) {
    // 画像をアップロード
    const imageRecord = await uploadImage(file);

    // 画像サイズを取得
    const dimensions = await getImageDimensions(imageRecord.id);
    if (!dimensions) {
      throw new Error('Failed to get image dimensions');
    }

    // プリセットを作成
    const name = file.name.replace(/\.[^.]+$/, ''); // 拡張子を除去
    const preset = await createNewPreset(
      name,
      imageRecord.id,
      dimensions.width,
      dimensions.height
    );

    // 状態を更新
    this.currentPreset = preset;
    canvasState.setSize(dimensions.width, dimensions.height);
    canvasState.setBaseImage(imageRecord.id);
    layerState.clear();

    await this.loadPresetList();
    return preset;
  }

  // プリセット保存
  async save() {
    if (!this.currentPreset) return;

    this.saveStatus = 'saving';

    try {
      const updatedPreset: PresetRecord = {
        ...this.currentPreset,
        canvas: {
          width: canvasState.width,
          height: canvasState.height,
          baseImageId: canvasState.baseImageId!,
        },
        layers: $state.snapshot(layerState.layers),
        updatedAt: Date.now(),
      };

      await savePreset(updatedPreset);
      this.currentPreset = updatedPreset;
      this.saveStatus = 'saved';

      await this.loadPresetList();
    } catch (error) {
      console.error('Failed to save preset:', error);
      this.saveStatus = 'unsaved';
      throw error;
    }
  }

  // 自動保存トリガー
  triggerAutoSave() {
    if (!this.currentPreset) return;

    this.saveStatus = 'unsaved';

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      this.save();
    }, this.autoSaveDelay);
  }

  // プリセット名変更
  async rename(name: string) {
    if (!this.currentPreset) return;

    await updatePresetName(this.currentPreset.id, name);
    this.currentPreset = { ...this.currentPreset, name, updatedAt: Date.now() };
    await this.loadPresetList();
  }

  // 別名で保存
  async saveAs(name: string) {
    if (!this.currentPreset) return null;

    const newPreset = await duplicatePresetInDb(this.currentPreset.id, name);
    if (!newPreset) return null;

    // 新しいプリセットに現在の状態を反映
    newPreset.canvas = {
      width: canvasState.width,
      height: canvasState.height,
      baseImageId: canvasState.baseImageId!,
    };
    newPreset.layers = $state.snapshot(layerState.layers);

    await savePreset(newPreset);
    this.currentPreset = newPreset;

    await this.loadPresetList();
    return newPreset;
  }

  // プリセット削除
  async deletePreset(id: string) {
    await deletePresetFromDb(id);

    if (this.currentPreset?.id === id) {
      this.currentPreset = null;
      canvasState.reset();
      layerState.clear();
    }

    await this.loadPresetList();
  }

  // プリセット複製
  async duplicatePreset(id: string) {
    const newPreset = await duplicatePresetInDb(id);
    await this.loadPresetList();
    return newPreset;
  }

  // デフォルト設定
  async setDefault(id: string) {
    await setDefaultPresetInDb(id);
    await this.loadPresetList();

    if (this.currentPreset?.id === id) {
      this.currentPreset = { ...this.currentPreset, isDefault: true };
    }
  }

  // クリーンアップ
  destroy() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
  }
}

export const presetState = new PresetState();
