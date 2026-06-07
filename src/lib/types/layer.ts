// テキストコンテンツ型（判別可能なユニオン型）
export type StaticTextContent = {
  type: 'static';
  value: string;
};

export type DateTextContent = {
  type: 'date';
  format: string;
  locale: 'ja' | 'en';
};

export type TextContent = StaticTextContent | DateTextContent;

// 共通レイヤープロパティ
export interface BaseLayer {
  id: string;
  name: string;
  position: { x: number; y: number };
  visible: boolean;
  zIndex: number;
  locked: boolean;
}

// 画像レイヤー
export interface ImageLayer extends BaseLayer {
  type: 'image';
  imageId: string;
  // 画像本来のサイズ（不変。操作対象ではない）
  naturalSize: { width: number; height: number };
  // 拡大率。リサイズ操作ではこの値を変更する
  scale: number;
  opacity: number;
}

// テキストスタイル
export interface TextOutline {
  enabled: boolean;
  width: number;
  color: string;
}

export interface TextShadow {
  enabled: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface TextStyle {
  fontId: string;
  fontSize: number;
  color: string;
  lineHeight: number;
  letterSpacing: number;
  align: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  bold: boolean;
  italic: boolean;
  underline: boolean;
  outline?: TextOutline;
  shadow?: TextShadow;
}

// テキストレイヤー
export interface TextLayer extends BaseLayer {
  type: 'text';
  content: TextContent;
  style: TextStyle;
}

// レイヤーユニオン型
export type Layer = ImageLayer | TextLayer;

// レイヤー作成用のデフォルト値
export const defaultTextStyle: TextStyle = {
  fontId: '',
  fontSize: 48,
  color: '#ffffff',
  lineHeight: 1.2,
  letterSpacing: 0,
  align: 'left',
  verticalAlign: 'top',
  bold: false,
  italic: false,
  underline: false,
};

export function createImageLayer(
  id: string,
  name: string,
  imageId: string,
  width: number,
  height: number,
  zIndex: number
): ImageLayer {
  return {
    id,
    name,
    type: 'image',
    imageId,
    position: { x: 0, y: 0 },
    naturalSize: { width, height },
    scale: 1,
    opacity: 1,
    visible: true,
    zIndex,
    locked: false,
  };
}

// 画像レイヤーの表示サイズ（本来のサイズ × 拡大率）を取得
export function getImageLayerSize(layer: ImageLayer): { width: number; height: number } {
  return {
    width: layer.naturalSize.width * layer.scale,
    height: layer.naturalSize.height * layer.scale,
  };
}

// 旧形式（size プロパティを持つ）の画像レイヤーを新形式へ移行する
export function migrateImageLayer(layer: ImageLayer): ImageLayer {
  if ('naturalSize' in layer && typeof layer.scale === 'number') {
    return layer;
  }
  // 旧データ: 保存済みの size を本来のサイズとして扱い scale=1 にする
  const legacy = layer as ImageLayer & { size?: { width: number; height: number } };
  const size = legacy.size ?? { width: 0, height: 0 };
  const { size: _omit, ...rest } = legacy;
  return {
    ...rest,
    naturalSize: { width: size.width, height: size.height },
    scale: 1,
  };
}

export function createTextLayer(
  id: string,
  name: string,
  content: TextContent,
  zIndex: number,
  style?: Partial<TextStyle>
): TextLayer {
  return {
    id,
    name,
    type: 'text',
    content,
    position: { x: 0, y: 0 },
    style: { ...defaultTextStyle, ...style },
    visible: true,
    zIndex,
    locked: false,
  };
}
