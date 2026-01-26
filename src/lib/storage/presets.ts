import { db, generateId } from './indexeddb';
import type { PresetRecord, Layer } from '$lib/types';
import { createPresetRecord } from '$lib/types';

// プリセット保存
export async function savePreset(preset: PresetRecord): Promise<string> {
  preset.updatedAt = Date.now();
  return await db.presets.put(preset);
}

// プリセット取得
export async function getPreset(id: string): Promise<PresetRecord | undefined> {
  return await db.presets.get(id);
}

// 全プリセット取得（更新日時の新しい順）
export async function getAllPresets(): Promise<PresetRecord[]> {
  return await db.presets.orderBy('updatedAt').reverse().toArray();
}

// プリセット削除
export async function deletePreset(id: string): Promise<void> {
  const preset = await getPreset(id);
  if (!preset) return;

  // プリセットに関連する画像・フォントの参照を確認
  const otherPresets = await db.presets.filter(p => p.id !== id).toArray();
  const usedImageIds = new Set<string>();
  const usedFontIds = new Set<string>();

  for (const p of otherPresets) {
    usedImageIds.add(p.canvas.baseImageId);
    if (p.thumbnailId) usedImageIds.add(p.thumbnailId);
    for (const layer of p.layers) {
      if (layer.type === 'image') {
        usedImageIds.add(layer.imageId);
      } else if (layer.type === 'text') {
        usedFontIds.add(layer.style.fontId);
      }
    }
  }

  // 未使用の画像を削除
  const imagesToDelete: string[] = [];
  if (!usedImageIds.has(preset.canvas.baseImageId)) {
    imagesToDelete.push(preset.canvas.baseImageId);
  }
  if (preset.thumbnailId && !usedImageIds.has(preset.thumbnailId)) {
    imagesToDelete.push(preset.thumbnailId);
  }
  for (const layer of preset.layers) {
    if (layer.type === 'image' && !usedImageIds.has(layer.imageId)) {
      imagesToDelete.push(layer.imageId);
    }
  }

  // 未使用のフォントを削除
  const fontsToDelete: string[] = [];
  for (const layer of preset.layers) {
    if (layer.type === 'text' && !usedFontIds.has(layer.style.fontId)) {
      fontsToDelete.push(layer.style.fontId);
    }
  }

  // トランザクションで一括削除
  await db.transaction('rw', [db.presets, db.images, db.fonts], async () => {
    await db.presets.delete(id);
    if (imagesToDelete.length > 0) {
      await db.images.bulkDelete(imagesToDelete);
    }
    if (fontsToDelete.length > 0) {
      await db.fonts.bulkDelete(fontsToDelete);
    }
  });
}

// プリセット複製
export async function duplicatePreset(id: string, newName?: string): Promise<PresetRecord | undefined> {
  const preset = await getPreset(id);
  if (!preset) return undefined;

  const newPreset: PresetRecord = {
    ...preset,
    id: generateId(),
    name: newName ?? `${preset.name} (コピー)`,
    isDefault: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await db.presets.add(newPreset);
  return newPreset;
}

// デフォルトプリセット取得
export async function getDefaultPreset(): Promise<PresetRecord | undefined> {
  return await db.presets.filter(p => p.isDefault).first();
}

// デフォルトプリセット設定
export async function setDefaultPreset(id: string): Promise<void> {
  await db.transaction('rw', db.presets, async () => {
    // 既存のデフォルトを解除
    const currentDefault = await db.presets.filter(p => p.isDefault).first();
    if (currentDefault) {
      await db.presets.update(currentDefault.id, { isDefault: false });
    }
    // 新しいデフォルトを設定
    await db.presets.update(id, { isDefault: true });
  });
}

// 新規プリセット作成
export async function createNewPreset(
  name: string,
  baseImageId: string,
  width: number,
  height: number
): Promise<PresetRecord> {
  const id = generateId();
  const preset = createPresetRecord(id, name, baseImageId, width, height);
  await db.presets.add(preset);
  return preset;
}

// プリセットのレイヤー更新
export async function updatePresetLayers(id: string, layers: Layer[]): Promise<void> {
  await db.presets.update(id, {
    layers,
    updatedAt: Date.now()
  });
}

// プリセット名更新
export async function updatePresetName(id: string, name: string): Promise<void> {
  await db.presets.update(id, {
    name,
    updatedAt: Date.now()
  });
}

// プリセットサムネイル更新
export async function updatePresetThumbnail(id: string, thumbnailId: string): Promise<void> {
  await db.presets.update(id, {
    thumbnailId,
    updatedAt: Date.now()
  });
}
