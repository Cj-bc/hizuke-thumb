import type { CanvasSettings, Guideline } from '$lib/types';
import { defaultCanvasSettings, ZOOM_MIN, ZOOM_MAX } from '$lib/types';
import { generateId } from '$lib/storage';

class CanvasState {
  // キャンバスサイズ
  width = $state(1920);
  height = $state(1080);
  baseImageId = $state<string | null>(null);

  // 表示設定
  zoom = $state(1.0);
  panOffset = $state({ x: 0, y: 0 });

  // 設定
  settings = $state<CanvasSettings>({ ...defaultCanvasSettings });

  // ガイドライン
  guidelines = $state<Guideline[]>([]);

  // 派生状態
  viewTransform = $derived({
    scale: this.zoom,
    translateX: this.panOffset.x,
    translateY: this.panOffset.y
  });

  aspectRatio = $derived(this.width / this.height);

  // ズーム操作
  setZoom(zoom: number) {
    this.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom));
  }

  zoomIn() {
    this.setZoom(this.zoom * 1.2);
  }

  zoomOut() {
    this.setZoom(this.zoom / 1.2);
  }

  zoomToFit(containerWidth: number, containerHeight: number) {
    const scaleX = containerWidth / this.width;
    const scaleY = containerHeight / this.height;
    this.zoom = Math.min(scaleX, scaleY, 1) * 0.9; // 90%でフィット
    this.panOffset = { x: 0, y: 0 };
  }

  resetZoom() {
    this.zoom = 1.0;
    this.panOffset = { x: 0, y: 0 };
  }

  // パン操作
  pan(delta: { x: number; y: number }) {
    this.panOffset = {
      x: this.panOffset.x + delta.x,
      y: this.panOffset.y + delta.y
    };
  }

  resetPan() {
    this.panOffset = { x: 0, y: 0 };
  }

  // キャンバスサイズ設定
  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  setBaseImage(imageId: string | null) {
    this.baseImageId = imageId;
  }

  // 設定操作
  toggleGrid() {
    this.settings.showGrid = !this.settings.showGrid;
  }

  toggleGuides() {
    this.settings.showGuides = !this.settings.showGuides;
  }

  toggleRuler() {
    this.settings.showRuler = !this.settings.showRuler;
  }

  toggleSnapToGrid() {
    this.settings.snapToGrid = !this.settings.snapToGrid;
  }

  toggleSnapToLayers() {
    this.settings.snapToLayers = !this.settings.snapToLayers;
  }

  toggleSnapToCenter() {
    this.settings.snapToCenter = !this.settings.snapToCenter;
  }

  setGridSize(size: number) {
    this.settings.gridSize = size;
  }

  // ガイドライン操作
  addGuideline(type: 'horizontal' | 'vertical', position: number) {
    const id = generateId();
    this.guidelines = [...this.guidelines, { id, type, position }];
    return id;
  }

  removeGuideline(id: string) {
    this.guidelines = this.guidelines.filter(g => g.id !== id);
  }

  moveGuideline(id: string, position: number) {
    this.guidelines = this.guidelines.map(g =>
      g.id === id ? { ...g, position } : g
    );
  }

  clearGuidelines() {
    this.guidelines = [];
  }

  // スナップ計算
  snapPosition(position: { x: number; y: number }): { x: number; y: number } {
    let { x, y } = position;

    if (this.settings.snapToGrid) {
      const gridSize = this.settings.gridSize;
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }

    if (this.settings.snapToCenter) {
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      const threshold = 10 / this.zoom;

      if (Math.abs(x - centerX) < threshold) x = centerX;
      if (Math.abs(y - centerY) < threshold) y = centerY;
    }

    return { x, y };
  }

  // リセット
  reset() {
    this.width = 1920;
    this.height = 1080;
    this.baseImageId = null;
    this.zoom = 1.0;
    this.panOffset = { x: 0, y: 0 };
    this.settings = { ...defaultCanvasSettings };
    this.guidelines = [];
  }
}

export const canvasState = new CanvasState();
