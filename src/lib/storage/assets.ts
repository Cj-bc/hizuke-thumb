import { db, generateId } from './indexeddb';
import type { ImageRecord, FontRecord } from '$lib/types';

// ===== 画像操作 =====

// 画像保存
export async function saveImage(
  name: string,
  data: Blob,
  mimeType: string
): Promise<ImageRecord> {
  const record: ImageRecord = {
    id: generateId(),
    name,
    mimeType,
    data,
    createdAt: Date.now(),
  };
  await db.images.add(record);
  return record;
}

// 画像取得
export async function getImage(id: string): Promise<ImageRecord | undefined> {
  return await db.images.get(id);
}

// 画像削除
export async function deleteImage(id: string): Promise<void> {
  await db.images.delete(id);
}

// 画像のURL取得（Object URL）
export async function getImageUrl(id: string): Promise<string | undefined> {
  const image = await getImage(id);
  if (!image) return undefined;
  return URL.createObjectURL(image.data);
}

// 画像からHTMLImageElement作成
export async function loadImageElement(id: string): Promise<HTMLImageElement | undefined> {
  const url = await getImageUrl(id);
  if (!url) return undefined;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${id}`));
    };
    img.src = url;
  });
}

// ファイルから画像を読み込んで保存
export async function uploadImage(file: File): Promise<ImageRecord> {
  const data = new Blob([await file.arrayBuffer()], { type: file.type });
  return await saveImage(file.name, data, file.type);
}

// 画像のサイズを取得
export async function getImageDimensions(id: string): Promise<{ width: number; height: number } | undefined> {
  const img = await loadImageElement(id);
  if (!img) return undefined;
  return { width: img.naturalWidth, height: img.naturalHeight };
}

// ===== フォント操作 =====

// フォント保存
export async function saveFont(
  name: string,
  family: string,
  data: Blob
): Promise<FontRecord> {
  const record: FontRecord = {
    id: generateId(),
    name,
    family,
    data,
    createdAt: Date.now(),
  };
  await db.fonts.add(record);
  return record;
}

// フォント取得
export async function getFont(id: string): Promise<FontRecord | undefined> {
  return await db.fonts.get(id);
}

// 全フォント取得
export async function getAllFonts(): Promise<FontRecord[]> {
  return await db.fonts.orderBy('name').toArray();
}

// フォント削除
export async function deleteFont(id: string): Promise<void> {
  await db.fonts.delete(id);
}

// フォントをブラウザに登録
export async function registerFont(id: string): Promise<FontFace | undefined> {
  const font = await getFont(id);
  if (!font) return undefined;

  const fontFace = new FontFace(font.family, await font.data.arrayBuffer());
  await fontFace.load();
  document.fonts.add(fontFace);
  return fontFace;
}

// ファイルからフォントを読み込んで保存・登録
export async function uploadFont(file: File): Promise<FontRecord> {
  const data = new Blob([await file.arrayBuffer()], { type: file.type });
  // ファイル名から拡張子を除去してfamily名に使用
  const family = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');
  const record = await saveFont(file.name, family, data);
  await registerFont(record.id);
  return record;
}

// プリセットで使用されているフォントを登録
export async function registerFontsForPreset(fontIds: string[]): Promise<void> {
  for (const id of fontIds) {
    if (id) {
      await registerFont(id);
    }
  }
}

// ===== 設定操作 =====

// 設定保存
export async function saveSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value });
}

// 設定取得
export async function getSetting<T>(key: string): Promise<T | undefined> {
  const record = await db.settings.get(key);
  return record?.value as T | undefined;
}

// 設定削除
export async function deleteSetting(key: string): Promise<void> {
  await db.settings.delete(key);
}
