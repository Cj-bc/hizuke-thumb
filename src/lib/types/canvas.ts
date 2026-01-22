// Canvas表示設定
export interface ViewTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

// Canvas設定
export interface CanvasSettings {
  showGrid: boolean;
  showGuides: boolean;
  showRuler: boolean;
  gridSize: number;
  snapToGrid: boolean;
  snapToLayers: boolean;
  snapToCenter: boolean;
}

// ズームプリセット
export const ZOOM_PRESETS = [0.25, 0.5, 1.0, 2.0, 4.0] as const;
export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 4.0;

// ガイドライン
export interface Guideline {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
}

// 選択状態
export interface SelectionState {
  selectedLayerId: string | null;
  isDragging: boolean;
  dragStart: { x: number; y: number } | null;
}

// Canvas状態
export interface CanvasState {
  width: number;
  height: number;
  zoom: number;
  panOffset: { x: number; y: number };
  settings: CanvasSettings;
  guidelines: Guideline[];
}

// デフォルト設定
export const defaultCanvasSettings: CanvasSettings = {
  showGrid: false,
  showGuides: true,
  showRuler: true,
  gridSize: 20,
  snapToGrid: false,
  snapToLayers: true,
  snapToCenter: true,
};
