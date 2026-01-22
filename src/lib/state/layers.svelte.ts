import type { Layer, ImageLayer, TextLayer, TextContent, TextStyle } from '$lib/types';
import { createImageLayer, createTextLayer, defaultTextStyle } from '$lib/types';
import { generateId } from '$lib/storage';

class LayerState {
  layers = $state<Layer[]>([]);
  selectedLayerId = $state<string | null>(null);

  // 派生状態
  selectedLayer = $derived(
    this.layers.find(l => l.id === this.selectedLayerId) ?? null
  );

  visibleLayers = $derived(
    this.layers.filter(l => l.visible)
  );

  sortedLayers = $derived(
    [...this.layers].sort((a, b) => a.zIndex - b.zIndex)
  );

  // レイヤー追加
  addImageLayer(imageId: string, name: string, width: number, height: number) {
    const id = generateId();
    const maxZIndex = this.layers.length > 0
      ? Math.max(...this.layers.map(l => l.zIndex))
      : 0;
    const layer = createImageLayer(id, name, imageId, width, height, maxZIndex + 1);
    this.layers = [...this.layers, layer];
    this.selectedLayerId = id;
    return layer;
  }

  addTextLayer(content: TextContent, name?: string, style?: Partial<TextStyle>) {
    const id = generateId();
    const maxZIndex = this.layers.length > 0
      ? Math.max(...this.layers.map(l => l.zIndex))
      : 0;
    const layerName = name ?? (content.type === 'static' ? 'テキスト' : '日付');
    const layer = createTextLayer(id, layerName, content, maxZIndex + 1, style);
    this.layers = [...this.layers, layer];
    this.selectedLayerId = id;
    return layer;
  }

  // レイヤー削除
  removeLayer(id: string) {
    this.layers = this.layers.filter(l => l.id !== id);
    if (this.selectedLayerId === id) {
      this.selectedLayerId = this.layers.length > 0 ? this.layers[this.layers.length - 1].id : null;
    }
  }

  // レイヤー複製
  duplicateLayer(id: string) {
    const layer = this.layers.find(l => l.id === id);
    if (!layer) return null;

    const newId = generateId();
    const maxZIndex = Math.max(...this.layers.map(l => l.zIndex));
    const newLayer: Layer = {
      ...structuredClone(layer),
      id: newId,
      name: `${layer.name} (コピー)`,
      zIndex: maxZIndex + 1,
      position: {
        x: layer.position.x + 20,
        y: layer.position.y + 20,
      },
    } as Layer;

    this.layers = [...this.layers, newLayer];
    this.selectedLayerId = newId;
    return newLayer;
  }

  // レイヤー選択
  selectLayer(id: string | null) {
    this.selectedLayerId = id;
  }

  // レイヤー移動
  moveLayer(id: string, delta: { x: number; y: number }) {
    this.layers = this.layers.map(l =>
      l.id === id
        ? { ...l, position: { x: l.position.x + delta.x, y: l.position.y + delta.y } }
        : l
    );
  }

  // レイヤー位置設定
  setLayerPosition(id: string, position: { x: number; y: number }) {
    this.layers = this.layers.map(l =>
      l.id === id ? { ...l, position } : l
    );
  }

  // 表示/非表示切り替え
  toggleVisibility(id: string) {
    this.layers = this.layers.map(l =>
      l.id === id ? { ...l, visible: !l.visible } : l
    );
  }

  // ロック切り替え
  toggleLock(id: string) {
    this.layers = this.layers.map(l =>
      l.id === id ? { ...l, locked: !l.locked } : l
    );
  }

  // レイヤー名変更
  renameLayer(id: string, name: string) {
    this.layers = this.layers.map(l =>
      l.id === id ? { ...l, name } : l
    );
  }

  // Z-index操作
  bringToFront(id: string) {
    const maxZIndex = Math.max(...this.layers.map(l => l.zIndex));
    this.layers = this.layers.map(l =>
      l.id === id ? { ...l, zIndex: maxZIndex + 1 } : l
    );
  }

  sendToBack(id: string) {
    const minZIndex = Math.min(...this.layers.map(l => l.zIndex));
    this.layers = this.layers.map(l =>
      l.id === id ? { ...l, zIndex: minZIndex - 1 } : l
    );
  }

  bringForward(id: string) {
    const layer = this.layers.find(l => l.id === id);
    if (!layer) return;

    const layersAbove = this.layers
      .filter(l => l.zIndex > layer.zIndex)
      .sort((a, b) => a.zIndex - b.zIndex);

    if (layersAbove.length === 0) return;

    const nextLayer = layersAbove[0];
    this.layers = this.layers.map(l => {
      if (l.id === id) return { ...l, zIndex: nextLayer.zIndex };
      if (l.id === nextLayer.id) return { ...l, zIndex: layer.zIndex };
      return l;
    });
  }

  sendBackward(id: string) {
    const layer = this.layers.find(l => l.id === id);
    if (!layer) return;

    const layersBelow = this.layers
      .filter(l => l.zIndex < layer.zIndex)
      .sort((a, b) => b.zIndex - a.zIndex);

    if (layersBelow.length === 0) return;

    const prevLayer = layersBelow[0];
    this.layers = this.layers.map(l => {
      if (l.id === id) return { ...l, zIndex: prevLayer.zIndex };
      if (l.id === prevLayer.id) return { ...l, zIndex: layer.zIndex };
      return l;
    });
  }

  // 画像レイヤー更新
  updateImageLayer(id: string, updates: Partial<Omit<ImageLayer, 'id' | 'type'>>) {
    this.layers = this.layers.map(l =>
      l.id === id && l.type === 'image'
        ? { ...l, ...updates }
        : l
    );
  }

  // テキストレイヤー更新
  updateTextLayer(id: string, updates: Partial<Omit<TextLayer, 'id' | 'type'>>) {
    this.layers = this.layers.map(l =>
      l.id === id && l.type === 'text'
        ? { ...l, ...updates }
        : l
    );
  }

  // テキストスタイル更新
  updateTextStyle(id: string, styleUpdates: Partial<TextStyle>) {
    this.layers = this.layers.map(l =>
      l.id === id && l.type === 'text'
        ? { ...l, style: { ...l.style, ...styleUpdates } }
        : l
    );
  }

  // レイヤー一括設定（プリセット読み込み用）
  setLayers(layers: Layer[]) {
    this.layers = layers;
    this.selectedLayerId = layers.length > 0 ? layers[layers.length - 1].id : null;
  }

  // クリア
  clear() {
    this.layers = [];
    this.selectedLayerId = null;
  }
}

export const layerState = new LayerState();
