/**
 * ファイル選択ダイアログを開く
 */
export function openFileDialog(
  accept: string,
  multiple: boolean = false
): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;

    input.onchange = () => {
      const files = Array.from(input.files || []);
      resolve(files);
    };

    input.oncancel = () => {
      resolve([]);
    };

    input.click();
  });
}

/**
 * 画像ファイル選択
 */
export function selectImageFile(): Promise<File | null> {
  return openFileDialog('image/png,image/jpeg,image/webp', false)
    .then(files => files[0] || null);
}

/**
 * フォントファイル選択
 */
export function selectFontFile(): Promise<File | null> {
  return openFileDialog('.ttf,.otf,.woff,.woff2', false)
    .then(files => files[0] || null);
}

/**
 * JSONファイル選択
 */
export function selectJsonFile(): Promise<File | null> {
  return openFileDialog('.json,application/json', false)
    .then(files => files[0] || null);
}

/**
 * ファイルをテキストとして読み込む
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * ファイルをDataURLとして読み込む
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * BlobをダウンロードとしてDL
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Canvasを画像としてダウンロード
 */
export async function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string
): Promise<void> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to create blob'));
      },
      'image/png'
    );
  });
  downloadBlob(blob, filename);
}

/**
 * JSONをダウンロード
 */
export function downloadJson(data: object, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename);
}

/**
 * ファイル名を安全に整形
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .trim();
}

/**
 * 日付を含むファイル名生成
 */
export function generateFilename(
  template: string,
  date: Date,
  presetName?: string
): string {
  const dateStr = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');

  let filename = template
    .replace('{date}', dateStr)
    .replace('{preset_name}', presetName ? sanitizeFilename(presetName) : 'preset');

  return filename;
}
