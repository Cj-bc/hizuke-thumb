import { getImage } from '$lib/storage';

// 画像キャッシュ
const imageCache = new Map<string, HTMLImageElement>();
const loadingPromises = new Map<string, Promise<HTMLImageElement>>();

/**
 * IndexedDBから画像を読み込み
 */
export async function loadImage(imageId: string): Promise<HTMLImageElement | null> {
  // キャッシュチェック
  if (imageCache.has(imageId)) {
    return imageCache.get(imageId)!;
  }

  // 既に読み込み中の場合は待機
  if (loadingPromises.has(imageId)) {
    return loadingPromises.get(imageId)!;
  }

  // 新規読み込み
  const loadPromise = (async () => {
    const imageRecord = await getImage(imageId);
    if (!imageRecord) {
      return null;
    }

    const url = URL.createObjectURL(imageRecord.data);
    const img = new Image();

    return new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => {
        URL.revokeObjectURL(url);
        imageCache.set(imageId, img);
        loadingPromises.delete(imageId);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        loadingPromises.delete(imageId);
        reject(new Error(`Failed to load image: ${imageId}`));
      };
      img.src = url;
    });
  })();

  loadingPromises.set(imageId, loadPromise as Promise<HTMLImageElement>);
  return loadPromise;
}

/**
 * キャッシュからの画像取得（同期）
 */
export function getCachedImage(imageId: string): HTMLImageElement | undefined {
  return imageCache.get(imageId);
}

/**
 * 画像キャッシュのクリア
 */
export function clearImageCache(imageId?: string) {
  if (imageId) {
    imageCache.delete(imageId);
  } else {
    imageCache.clear();
  }
}

/**
 * 画像がキャッシュされているかチェック
 */
export function isImageCached(imageId: string): boolean {
  return imageCache.has(imageId);
}

/**
 * 複数画像の事前読み込み
 */
export async function preloadImages(imageIds: string[]): Promise<void> {
  await Promise.all(
    imageIds.map(id => loadImage(id).catch(() => null))
  );
}
