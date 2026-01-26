import type { TextLayer, TextContent, TextStyle } from '$lib/types';
import { formatDate } from '$lib/utils';
import { getFont } from '$lib/storage';

// フォントキャッシュ
const fontCache = new Map<string, string>();

/**
 * フォントファミリー名を取得
 */
export async function getFontFamily(fontId: string): Promise<string> {
  if (!fontId) return 'sans-serif';

  if (fontCache.has(fontId)) {
    return fontCache.get(fontId)!;
  }

  const font = await getFont(fontId);
  if (!font) return 'sans-serif';

  fontCache.set(fontId, font.family);
  return font.family;
}

/**
 * テキストコンテンツをレンダリング可能な文字列に変換
 */
export function resolveTextContent(content: TextContent, date: Date): string {
  switch (content.type) {
    case 'static':
      return content.value;
    case 'date':
      return formatDate(date, content.format, content.locale);
  }
}

/**
 * Canvasにテキストを描画
 */
export async function renderText(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  date: Date
): Promise<void> {
  const text = resolveTextContent(layer.content, date);
  const { style, position } = layer;

  // フォント設定
  const fontFamily = await getFontFamily(style.fontId);
  const fontWeight = style.bold ? 'bold' : 'normal';
  const fontStyle = style.italic ? 'italic' : 'normal';
  ctx.font = `${fontStyle} ${fontWeight} ${style.fontSize}px "${fontFamily}"`;
  ctx.textAlign = style.align;
  ctx.textBaseline = style.verticalAlign === 'top' ? 'top' : style.verticalAlign === 'middle' ? 'middle' : 'bottom';

  // 複数行対応
  const lines = text.split('\n');
  const lineHeight = style.fontSize * style.lineHeight;

  // 描画位置計算
  let x = position.x;
  let y = position.y;

  // 各行を描画
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineY = y + i * lineHeight;

    // 文字間隔がある場合は1文字ずつ描画
    if (style.letterSpacing !== 0) {
      renderTextWithLetterSpacing(ctx, line, x, lineY, style);
    } else {
      // シャドウ
      if (style.shadow?.enabled) {
        ctx.save();
        ctx.shadowColor = style.shadow.color;
        ctx.shadowBlur = style.shadow.blur;
        ctx.shadowOffsetX = style.shadow.offsetX;
        ctx.shadowOffsetY = style.shadow.offsetY;
        ctx.fillStyle = style.shadow.color;
        ctx.fillText(line, x, lineY);
        ctx.restore();
      }

      // アウトライン
      if (style.outline?.enabled) {
        ctx.strokeStyle = style.outline.color;
        ctx.lineWidth = style.outline.width * 2;
        ctx.lineJoin = 'round';
        ctx.strokeText(line, x, lineY);
      }

      // メインテキスト
      ctx.fillStyle = style.color;
      ctx.fillText(line, x, lineY);

      // アンダーライン
      if (style.underline) {
        drawUnderline(ctx, line, x, lineY, style);
      }
    }
  }
}

/**
 * 文字間隔付きでテキスト描画
 */
function renderTextWithLetterSpacing(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  style: TextStyle
): void {
  const chars = [...text];
  let currentX = x;

  // テキスト揃えに応じて開始位置を調整
  if (style.align === 'center' || style.align === 'right') {
    const totalWidth = chars.reduce((width, char) => {
      return width + ctx.measureText(char).width + style.letterSpacing;
    }, -style.letterSpacing);

    if (style.align === 'center') {
      currentX = x - totalWidth / 2;
    } else {
      currentX = x - totalWidth;
    }
  }

  for (const char of chars) {
    // シャドウ
    if (style.shadow?.enabled) {
      ctx.save();
      ctx.shadowColor = style.shadow.color;
      ctx.shadowBlur = style.shadow.blur;
      ctx.shadowOffsetX = style.shadow.offsetX;
      ctx.shadowOffsetY = style.shadow.offsetY;
      ctx.fillStyle = style.shadow.color;
      ctx.fillText(char, currentX, y);
      ctx.restore();
    }

    // アウトライン
    if (style.outline?.enabled) {
      ctx.strokeStyle = style.outline.color;
      ctx.lineWidth = style.outline.width * 2;
      ctx.lineJoin = 'round';
      ctx.strokeText(char, currentX, y);
    }

    // メインテキスト
    ctx.fillStyle = style.color;
    ctx.fillText(char, currentX, y);

    currentX += ctx.measureText(char).width + style.letterSpacing;
  }
}

/**
 * アンダーライン描画
 */
function drawUnderline(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  style: TextStyle
): void {
  const metrics = ctx.measureText(text);
  const underlineY = y + style.fontSize * 0.1;
  const lineWidth = style.fontSize * 0.05;

  let startX = x;
  if (style.align === 'center') {
    startX = x - metrics.width / 2;
  } else if (style.align === 'right') {
    startX = x - metrics.width;
  }

  ctx.strokeStyle = style.color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(startX, underlineY);
  ctx.lineTo(startX + metrics.width, underlineY);
  ctx.stroke();
}

/**
 * テキストの境界ボックスを計算
 */
export function measureText(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  date: Date
): { width: number; height: number } {
  const text = resolveTextContent(layer.content, date);
  const { style } = layer;

  // フォント設定
  const fontFamily = fontCache.get(style.fontId) ?? 'sans-serif';
  const fontWeight = style.bold ? 'bold' : 'normal';
  const fontStyle = style.italic ? 'italic' : 'normal';
  ctx.font = `${fontStyle} ${fontWeight} ${style.fontSize}px "${fontFamily}"`;

  const lines = text.split('\n');
  const lineHeight = style.fontSize * style.lineHeight;

  let maxWidth = 0;
  for (const line of lines) {
    const metrics = ctx.measureText(line);
    const width = metrics.width + style.letterSpacing * (line.length - 1);
    maxWidth = Math.max(maxWidth, width);
  }

  const height = lines.length * lineHeight;

  return { width: maxWidth, height };
}
