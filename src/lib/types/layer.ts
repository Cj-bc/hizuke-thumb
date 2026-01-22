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
  size: { width: number; height: number };
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
    size: { width, height },
    opacity: 1,
    visible: true,
    zIndex,
    locked: false,
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
