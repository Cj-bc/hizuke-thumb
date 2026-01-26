import type { Layer, ImageLayer, TextLayer } from '$lib/types';
import { loadImage, getCachedImage, preloadImages } from './ImageLoader';
import { renderText, measureText } from './TextRenderer';

export interface RenderContext {
  date: Date;
  showSelection?: boolean;
  selectedLayerId?: string | null;
}

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private baseImageId: string | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  /**
   * キャンバスサイズを設定
   */
  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * ベース画像を設定
   */
  async setBaseImage(imageId: string | null) {
    this.baseImageId = imageId;
    if (imageId) {
      await loadImage(imageId);
    }
  }

  /**
   * レイヤーに必要な画像を事前読み込み
   */
  async preloadLayerImages(layers: Layer[]) {
    const imageIds: string[] = [];

    if (this.baseImageId) {
      imageIds.push(this.baseImageId);
    }

    for (const layer of layers) {
      if (layer.type === 'image') {
        imageIds.push(layer.imageId);
      }
    }

    await preloadImages(imageIds);
  }

  /**
   * キャンバスをクリア
   */
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * 全レイヤーを描画
   */
  async render(layers: Layer[], context: RenderContext) {
    this.clear();

    // ベース画像を描画
    if (this.baseImageId) {
      const baseImage = getCachedImage(this.baseImageId);
      if (baseImage) {
        this.ctx.drawImage(baseImage, 0, 0, this.width, this.height);
      }
    }

    // レイヤーをZ-indexでソート
    const sortedLayers = [...layers]
      .filter(l => l.visible)
      .sort((a, b) => a.zIndex - b.zIndex);

    // 各レイヤーを描画
    for (const layer of sortedLayers) {
      await this.renderLayer(layer, context);
    }
  }

  /**
   * 単一レイヤーを描画
   */
  private async renderLayer(layer: Layer, context: RenderContext) {
    if (layer.type === 'image') {
      await this.renderImageLayer(layer, context);
    } else if (layer.type === 'text') {
      await this.renderTextLayer(layer, context);
    }

    // 選択状態の表示
    if (context.showSelection && context.selectedLayerId === layer.id) {
      this.renderSelectionBox(layer, context);
    }
  }

  /**
   * 画像レイヤーを描画
   */
  private async renderImageLayer(layer: ImageLayer, _context: RenderContext) {
    const image = getCachedImage(layer.imageId);
    if (!image) {
      // 画像がキャッシュにない場合は読み込み
      const loadedImage = await loadImage(layer.imageId);
      if (!loadedImage) return;
    }

    const img = getCachedImage(layer.imageId);
    if (!img) return;

    this.ctx.save();
    this.ctx.globalAlpha = layer.opacity;
    this.ctx.drawImage(
      img,
      layer.position.x,
      layer.position.y,
      layer.size.width,
      layer.size.height
    );
    this.ctx.restore();
  }

  /**
   * テキストレイヤーを描画
   */
  private async renderTextLayer(layer: TextLayer, context: RenderContext) {
    await renderText(this.ctx, layer, context.date);
  }

  /**
   * 選択ボックスを描画
   */
  private renderSelectionBox(layer: Layer, context: RenderContext) {
    let bounds: { x: number; y: number; width: number; height: number };

    if (layer.type === 'image') {
      bounds = {
        x: layer.position.x,
        y: layer.position.y,
        width: layer.size.width,
        height: layer.size.height,
      };
    } else {
      // テキストの場合は計測
      const { width, height } = measureText(this.ctx, layer, context.date);
      bounds = {
        x: layer.position.x,
        y: layer.position.y,
        width,
        height,
      };

      // テキスト揃えによる調整
      if (layer.style.align === 'center') {
        bounds.x -= width / 2;
      } else if (layer.style.align === 'right') {
        bounds.x -= width;
      }
    }

    // 選択枠を描画
    this.ctx.save();
    this.ctx.strokeStyle = '#3b82f6';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
    this.ctx.restore();

    // コーナーハンドルを描画
    this.drawHandle(bounds.x - 4, bounds.y - 4);
    this.drawHandle(bounds.x + bounds.width + 4, bounds.y - 4);
    this.drawHandle(bounds.x - 4, bounds.y + bounds.height + 4);
    this.drawHandle(bounds.x + bounds.width + 4, bounds.y + bounds.height + 4);
  }

  /**
   * リサイズハンドルを描画
   */
  private drawHandle(x: number, y: number) {
    const size = 8;
    this.ctx.save();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#3b82f6';
    this.ctx.lineWidth = 2;
    this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
    this.ctx.strokeRect(x - size / 2, y - size / 2, size, size);
    this.ctx.restore();
  }

  /**
   * キャンバスをBlobとして出力
   */
  async toBlob(type: string = 'image/png', quality?: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        type,
        quality
      );
    });
  }

  /**
   * キャンバスをDataURLとして出力
   */
  toDataURL(type: string = 'image/png', quality?: number): string {
    return this.canvas.toDataURL(type, quality);
  }

  /**
   * オフスクリーンキャンバスで描画してBlobを返す
   */
  async renderToBlob(layers: Layer[], context: RenderContext): Promise<Blob> {
    // 現在の状態を保存
    const originalWidth = this.canvas.width;
    const originalHeight = this.canvas.height;

    // 実際のサイズで描画
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    await this.render(layers, { ...context, showSelection: false });

    const blob = await this.toBlob();

    // 元のサイズに戻す
    this.canvas.width = originalWidth;
    this.canvas.height = originalHeight;

    return blob;
  }

  /**
   * Canvas要素を取得
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 描画コンテキストを取得
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
