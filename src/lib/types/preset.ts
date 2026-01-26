import type { Layer } from './layer';

// プリセットレコード（IndexedDB用）
export interface PresetRecord {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
  canvas: {
    width: number;
    height: number;
    baseImageId: string;
  };
  layers: Layer[];
  thumbnailId: string;
}

// 画像レコード（IndexedDB用）
export interface ImageRecord {
  id: string;
  name: string;
  mimeType: string;
  data: Blob;
  createdAt: number;
}

// フォントレコード（IndexedDB用）
export interface FontRecord {
  id: string;
  name: string;
  family: string;
  data: Blob;
  createdAt: number;
}

// 設定レコード（IndexedDB用）
export interface SettingsRecord {
  key: string;
  value: unknown;
}

// プリセットエクスポート形式
export interface PresetExport {
  version: string;
  name: string;
  canvas: {
    width: number;
    height: number;
  };
  layers: Layer[];
  requiredAssets: {
    images: string[];
    fonts: string[];
  };
}

// 保存ステータス
export type SaveStatus = 'saved' | 'saving' | 'unsaved';

// デフォルトプリセット作成ヘルパー
export function createPresetRecord(
  id: string,
  name: string,
  baseImageId: string,
  width: number,
  height: number
): PresetRecord {
  const now = Date.now();
  return {
    id,
    name,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
    canvas: {
      width,
      height,
      baseImageId,
    },
    layers: [],
    thumbnailId: '',
  };
}
