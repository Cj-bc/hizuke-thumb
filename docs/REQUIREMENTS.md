# ひづけサムネ (hizuke-thumb) 要件定義書

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [機能要件](#2-機能要件)
3. [非機能要件](#3-非機能要件)
4. [UI/UX要件](#4-uiux要件)
5. [将来の拡張性への配慮](#5-将来の拡張性への配慮)
6. [開発ロードマップ](#6-開発ロードマップ)
7. [技術仕様詳細](#7-技術仕様詳細)

---

## 1. プロジェクト概要

### 1.1 目的

「ひづけサムネ」は、配信や動画のサムネイル作成において、ベース画像に日付や曜日などの可変要素を追加する作業を効率化するWebアプリケーションです。

### 1.2 技術スタック

- **言語**: TypeScript
- **フレームワーク**: Svelte 5.x (Runes API使用)
- **パッケージマネージャー**: Bun
- **ビルドツール**: Vite 7.x
- **状態管理**: Svelte 5 Runes ($state, $derived等)
- **スタイリング**: TailwindCSS 4.x
- **データ永続化**: IndexedDB (Dexie.js 4.x)
- **PWA対応**: vite-plugin-pwa 1.x
- **テスト**: Vitest 4.x
- **動作環境**: モダンブラウザ（Chrome, Firefox, Safari, Edge）

### 1.3 開発環境要件

- **Bun**: 1.0以上
- **推奨OS**: macOS, Linux (Windows: WSL2推奨)
- **Node.js**: 不要（Bunが代替）

### 1.4 プロジェクト構成

```
hizuke-thumb/
├── public/
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── lib/
│   │   ├── canvas/
│   │   │   ├── CanvasEngine.ts        # Canvas描画エンジン
│   │   │   ├── TextRenderer.ts        # テキスト描画
│   │   │   └── ImageLoader.ts         # 画像読み込み
│   │   ├── layers/
│   │   │   ├── LayerManager.svelte.ts # レイヤー管理（Runes使用）
│   │   │   └── LayerTransform.ts      # 位置・変形計算
│   │   ├── storage/
│   │   │   ├── indexeddb.ts           # IndexedDB ラッパー（Dexie.js使用）
│   │   │   ├── presets.ts             # プリセット操作
│   │   │   └── assets.ts              # 画像・フォント管理
│   │   ├── state/
│   │   │   ├── preset.svelte.ts       # プリセット状態（Runes）
│   │   │   ├── layers.svelte.ts       # レイヤー状態（Runes）
│   │   │   └── canvas.svelte.ts       # Canvas状態（Runes）
│   │   ├── utils/
│   │   │   ├── dateFormatter.ts       # 日付フォーマット
│   │   │   ├── fileHandler.ts         # ファイル操作
│   │   │   └── shortcuts.ts           # キーボードショートカット
│   │   └── types/
│   │       ├── preset.ts              # プリセット型定義
│   │       ├── layer.ts               # レイヤー型定義
│   │       ├── canvas.ts              # Canvas型定義
│   │       └── index.ts               # 型エクスポート
│   ├── routes/
│   │   └── +page.svelte               # メインページ
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── CanvasEditor.svelte    # Canvas編集エリア
│   │   │   ├── CanvasPreview.svelte   # プレビュー
│   │   │   └── CanvasToolbar.svelte   # ツールバー
│   │   ├── properties/
│   │   │   ├── PropertiesPanel.svelte # プロパティパネル（右）
│   │   │   ├── ImageProperties.svelte # 画像レイヤープロパティ
│   │   │   ├── TextProperties.svelte  # テキストレイヤープロパティ
│   │   │   └── LayerPanel.svelte      # レイヤーパネル（プロパティの下）
│   │   ├── layers/
│   │   │   └── LayerItem.svelte       # レイヤーアイテム
│   │   ├── presets/
│   │   │   ├── PresetSelector.svelte  # プリセット選択
│   │   │   ├── PresetCard.svelte      # プリセットカード
│   │   │   ├── PresetSaveDialog.svelte# プリセット保存ダイアログ
│   │   │   └── PresetManager.svelte   # プリセット管理
│   │   ├── generation/
│   │   │   ├── DatePicker.svelte      # 日付選択（単一）
│   │   │   ├── DateRangePicker.svelte # 日付範囲選択（複数）
│   │   │   ├── GenerationPreview.svelte # 生成プレビュー
│   │   │   └── GenerationDialog.svelte  # 生成ダイアログ
│   │   ├── ui/
│   │   │   ├── Button.svelte
│   │   │   ├── Input.svelte
│   │   │   ├── Modal.svelte
│   │   │   ├── ColorPicker.svelte
│   │   │   └── Dropdown.svelte
│   │   └── layout/
│   │       ├── Header.svelte
│   │       └── MainLayout.svelte
│   ├── workers/
│   │   └── image-processor.ts         # Web Worker（画像処理）
│   ├── app.html
│   ├── app.css
│   └── main.ts
├── tests/
│   ├── unit/
│   └── integration/
├── .github/
│   └── workflows/
│       └── ci.yml                      # GitHub Actions (Bun使用)
├── vite.config.ts
├── svelte.config.js
├── tailwind.config.js
├── tsconfig.json
├── bunfig.toml                         # Bun設定（オプション）
├── bun.lockb                           # Bunロックファイル
├── package.json
└── README.md
```

---

## 2. 機能要件

### 2.1 プロジェクト管理

#### 2.1.1 プリセット機能

- 複数のプリセット（テンプレート）を作成・管理可能
- 各プリセットは独立して以下を保持：
  - プリセット名（ユーザーが保存時に指定）
  - ベース画像（バイナリデータ）
  - レイヤー構成（画像・テキスト）
  - フォントファイル（バイナリデータ）
  - レイアウト設定
  - メタデータ（作成日時、最終更新日時）
- **デフォルト名**: プリセット未保存時はベース画像のファイル名を使用
- デフォルトプリセットの設定が可能
- 起動時は自動的にデフォルトプリセットを読み込み

#### 2.1.2 プリセット保存フロー

**初回作成時**:
1. ユーザーがベース画像をアップロード
2. 自動的に新しいプリセットが作成される（名前はベース画像のファイル名）
3. IndexedDBに自動保存（変更の度に）
4. ユーザーが「名前を付けて保存」を選択すると、プリセット名入力ダイアログが表示
5. プリセット名を入力して保存

**編集中**:
- 変更は自動的にIndexedDBに保存（Auto-save）
- ヘッダーに保存ステータス表示（「保存済み」「保存中...」）

**明示的な保存**:
- `Ctrl/Cmd + S` または「保存」ボタンでプリセット名変更ダイアログを表示
- 既存のプリセット名を変更可能
- 「別名で保存」でプリセットを複製可能

#### 2.1.3 プリセット選択UI

- プリセット一覧をグリッド表示（モーダルダイアログ）
- 各プリセットに以下を表示：
  - サムネイル画像（自動生成）
  - プリセット名
  - 最終更新日時
  - デフォルトバッジ（該当する場合）
- プリセット操作：
  - 選択（読み込み）
  - 削除（確認ダイアログ付き）
  - 複製
  - デフォルト設定/解除

#### 2.1.4 エクスポート/インポート

**エクスポート**:
- プリセット設定をJSON形式でエクスポート
- **画像とフォントは含めない**（ライセンス配慮）
- エクスポート内容：

```typescript
interface PresetExport {
  version: string;           // スキーマバージョン
  name: string;
  canvas: {
    width: number;
    height: number;
  };
  layers: LayerConfig[];     // 位置、スタイル等（画像データなし）
  requiredAssets: {
    images: string[];        // 必要な画像ファイル名リスト
    fonts: string[];         // 必要なフォントファイル名リスト
  };
}
```

**インポート**:
- JSON ファイルを読み込み
- 必要なアセット（画像・フォント）を個別にアップロード
- アセットが揃ったらプリセット作成完了

---

### 2.2 キャンバス設定

#### 2.2.1 ベース画像

- ユーザーが任意の画像をアップロード
- 対応形式: PNG, JPEG, WebP
- アップロードした画像のサイズがキャンバスサイズとなる
- サイズ制限: なし（ブラウザの処理可能範囲内）
- 画像はIndexedDBに保存

#### 2.2.2 出力設定

- 出力解像度: ベース画像と同じ
- 出力形式: PNG
- ファイル名: カスタマイズ可能
  - デフォルト: `thumbnail_YYYYMMDD.png`
  - 変数使用可能: `{date}`, `{preset_name}` 等

---

### 2.3 レイヤー管理

#### 2.3.1 レイヤータイプ

**画像レイヤー**:

```typescript
interface ImageLayer {
  id: string;
  name: string;
  type: 'image';
  imageId: string;           // IndexedDB内の画像ID
  position: { x: number; y: number };
  size: { width: number; height: number };
  opacity: number;           // 0-1
  visible: boolean;
  zIndex: number;
  locked: boolean;           // 編集ロック
}
```

**テキストレイヤー**:

```typescript
// テキストコンテンツ型（判別可能なユニオン型）
type StaticTextContent = {
  type: 'static';
  value: string;
};

type DateTextContent = {
  type: 'date';
  format: string;
  locale: 'ja' | 'en';
};

type TextContent = StaticTextContent | DateTextContent;

interface TextLayer {
  id: string;
  name: string;
  type: 'text';
  content: TextContent;  // 判別可能なユニオン型
  position: { x: number; y: number };
  style: {
    fontId: string;          // IndexedDB内のフォントID
    fontSize: number;
    color: string;           // hex
    lineHeight: number;
    letterSpacing: number;
    align: 'left' | 'center' | 'right';
    verticalAlign: 'top' | 'middle' | 'bottom';
    bold: boolean;
    italic: boolean;
    underline: boolean;
    outline?: {
      enabled: boolean;
      width: number;
      color: string;
    };
    shadow?: {
      enabled: boolean;
      offsetX: number;
      offsetY: number;
      blur: number;
      color: string;
    };
  };
  visible: boolean;
  zIndex: number;
  locked: boolean;
}
```

**テキストコンテンツタイプの拡張性**:

```typescript
// 各タイプのレンダラー（型安全）
const textRenderers = {
  'static': (content: StaticTextContent) => content.value,
  'date': (content: DateTextContent, context: { date: Date }) => 
    formatDate(context.date, content.format, content.locale),
} as const;

// 汎用レンダリング関数
function renderTextContent(content: TextContent, context: { date: Date }): string {
  switch (content.type) {
    case 'static':
      return textRenderers.static(content);
    case 'date':
      return textRenderers.date(content, context);
  }
}
```

#### 2.3.2 日付フォーマット

**デフォルトプリセット（選択式）**:

**日本語フォーマット**:
- `2024/01/09`
- `2024.01.09`
- `2024-01-09`
- `2024年01月09日`
- `1月9日`
- `2024/01/09 (火)`
- `1/9 (火曜日)`

**英語フォーマット**:
- `Jan 9, 2024`
- `January 9, 2024`
- `1/9/2024`
- `Jan 9, 2024 (Tue)`
- `January 9, 2024 (Tuesday)`

**カスタムフォーマット（フォーマット文字列 + 言語選択）**:

UIには以下の2つの設定項目があります：
1. **フォーマット文字列**: ユーザーが自由に入力
2. **言語設定**: `日本語` / `英語` を選択（ドロップダウン、ロケールとは独立）

```
フォーマット文字列の構文:
yyyy: 4桁年 (2024)
yy:   2桁年 (24)
MM:   2桁月・ゼロ埋め (01)
M:    月 (1)
dd:   2桁日・ゼロ埋め (09)
d:    日 (9)

# 曜日（言語設定に依存）
EEEE: 曜日完全形 → 日本語: 月曜日 / 英語: Monday
EEE:  曜日短縮形 → 日本語: 月 / 英語: Mon
E:    曜日1文字 → 日本語: 月 / 英語: M

# その他
MMMM: 月名完全形 → 日本語: 1月 / 英語: January
MMM:  月名短縮形 → 日本語: 1月 / 英語: Jan
```

**使用例**:

| フォーマット文字列 | 言語 | 出力例 |
|------------------|------|--------|
| `yyyy/MM/dd (EEEE)` | 日本語 | `2024/01/09 (火曜日)` |
| `yyyy/MM/dd (EEEE)` | 英語 | `2024/01/09 (Tuesday)` |
| `MMMM d, yyyy` | 日本語 | `1月 9, 2024` |
| `MMMM d, yyyy` | 英語 | `January 9, 2024` |
| `M/d (EEE)` | 日本語 | `1/9 (火)` |
| `M/d (EEE)` | 英語 | `1/9 (Tue)` |

**実装**:

```typescript
// lib/utils/dateFormatter.ts
import { format } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';

const localeMap = {
  'ja': ja,
  'en': enUS
};

export function formatDate(
  date: Date, 
  formatString: string, 
  locale: 'ja' | 'en' = 'ja'
): string {
  return format(date, formatString, { locale: localeMap[locale] });
}
```

#### 2.3.3 レイヤー操作

- **追加**: 新規レイヤーの作成（画像 or テキスト）
- **削除**: 選択レイヤーの削除（確認あり）
- **複製**: 選択レイヤーのコピー
- **並び替え**: Z-order の変更
  - ドラッグ&ドロップ
  - 「最前面へ」「最背面へ」ボタン
  - 「1つ前へ」「1つ後ろへ」ボタン
- **表示/非表示**: トグルスイッチ
- **ロック/アンロック**: 編集防止
- **命名**: ダブルクリックまたは右クリックメニューで編集

#### 2.3.4 レイヤーパネルUI（右サイドバー下部）

**配置**: 
- 右サイドバー
- 上部: プロパティパネル
- 下部: レイヤーパネル

これはPhotoshop, Illustrator, CLIP STUDIO PAINT, GIMPなどのデフォルトレイアウトに準拠。

```svelte
<!-- components/properties/LayerPanel.svelte -->
<script lang="ts">
  import { layerState } from '$lib/state/layers.svelte';
  
  const addImageLayer = () => { /* ... */ };
  const addTextLayer = () => { /* ... */ };
</script>

<div class="layer-panel">
  <div class="layer-panel-header">
    <h3>レイヤー</h3>
    <div class="actions">
      <button onclick={addImageLayer}>+ 画像</button>
      <button onclick={addTextLayer}>+ テキスト</button>
    </div>
  </div>
  
  <div class="layer-list">
    {#each layerState.layers as layer (layer.id)}
      <LayerItem
        {layer}
        selected={layerState.selectedLayerId === layer.id}
        onselect={() => layerState.selectedLayerId = layer.id}
        ontoggle={() => toggleVisibility(layer.id)}
        ondelete={() => deleteLayer(layer.id)}
      />
    {/each}
  </div>
</div>
```

各レイヤーアイテムに表示：
- レイヤータイプアイコン（画像/テキスト）
- レイヤー名（編集可能）
- 表示/非表示アイコン（目のアイコン）
- ロックアイコン
- サムネイル（可能であれば）

---

### 2.4 テキスト機能

#### 2.4.1 フォント管理

- ユーザーが任意のフォントファイルをアップロード
- 対応形式: TTF, OTF, WOFF, WOFF2
- フォントはIndexedDBに保存
- プリセット毎に複数フォントを保持可能
- フォント一覧UI（プロパティパネル内）:
  - フォント名表示
  - プレビュー表示
  - 削除ボタン

#### 2.4.2 テキスト書式（プロパティパネル）

**基本設定**:
- フォントファミリー選択（ドロップダウン）
- フォントサイズ（数値入力、スライダー）
- 文字色（カラーピッカー）
- 行間（数値入力）
- 文字間隔（数値入力）
- テキスト揃え（左/中央/右）
- 垂直揃え（上/中央/下）

**書式設定** (チェックボックス):
- ボールド
- イタリック
- アンダーライン

**アウトライン（縁取り）**:
- 有効/無効トグル
- 太さ（数値入力、スライダー）
- 色（カラーピッカー）

**ドロップシャドウ**:
- 有効/無効トグル
- オフセットX（数値入力）
- オフセットY（数値入力）
- ぼかし量（数値入力、スライダー）
- 色（カラーピッカー）

---

### 2.5 配置・調整機能

#### 2.5.1 編集モード

**恒久的配置モード** (デフォルト):
- レイヤーの配置を設定
- 設定はプリセットに保存される
- 操作方法:
  - **マウスドラッグ**: レイヤーを直接移動
  - **数値入力**: X, Y座標をピクセル単位で入力
  - **矢印キー**: 1px単位で微調整
  - **Shift + 矢印キー**: 10px単位で移動

**一時的調整モード** (生成プレビュー時):
- 日付を指定した後の最終調整
- プリセットには保存されない
- 同じ操作方法を使用可能
- 「恒久的に保存」ボタンで保存可能

#### 2.5.2 配置補助機能

**グリッド表示**:
- ON/OFF切り替え可能
- グリッドサイズ設定（10px, 20px, 50px等）
- グリッド色・透明度設定

**スナップ機能**:
- グリッドスナップ
- レイヤー間スナップ（エッジ検出）
- キャンバス中央スナップ
- ON/OFF切り替え可能

**ガイドライン**:
- 水平・垂直ガイドを任意の位置に配置
- ルーラーからドラッグして作成
- ガイドへのスナップ
- ガイドの表示/非表示

**ルーラー**:
- 上部・左部にルーラー表示
- ピクセル単位の目盛り
- 現在のマウス位置を表示

**ズーム機能**:
- ズームレベル: 25%〜400%（連続的に調整可能）
- マウスホイールでスムーズにズーム
- キーボードショートカット（Ctrl/Cmd + +/-）で段階的にズーム
- ズームスライダーで任意の倍率に設定
- プリセット倍率: 25%, 50%, 100%, 200%, 400%（ワンクリックで適用）
- フィット表示（キャンバス全体を表示）

---

### 2.6 生成フロー

#### 2.6.1 ワークフロー

**初回セットアップ**:
1. アプリ起動
2. ベース画像をアップロード
3. 自動的に新規プリセットが作成される（名前はベース画像のファイル名）
4. フォントをアップロード（必要に応じて）
5. レイヤーを追加・配置
   - 画像レイヤー追加 → 画像アップロード → 配置
   - テキストレイヤー追加 → テキスト設定 → 配置
6. 各レイヤーのプロパティを設定
7. 自動保存（変更の度にIndexedDBに保存）
8. `Ctrl/Cmd + S` または「名前を付けて保存」でプリセット名を設定

**日常使用**:
1. アプリ起動（デフォルトプリセットが自動読み込み）
2. 「サムネイルを生成」ボタンをクリック
3. 生成ダイアログが表示
   - **単一日付モード**:
     - 日付選択（カレンダーUI）
     - 日付フォーマットに基づいて自動生成（曜日含む）
     - プレビュー表示（リアルタイム更新）
   - **複数日付モード**:
     - 複数の日付を選択（カレンダーUIで複数選択）
     - または日付範囲を指定（開始日〜終了日）
     - 選択された日付のリストを表示
     - 最初の日付のプレビューを表示
4. 必要に応じて一時的な位置調整
   - プレビュー上でドラッグ
   - または数値入力
5. 「ダウンロード」ボタンでPNG保存
   - **単一日付**: 1つのPNGファイルをダウンロード
   - **複数日付**: ZIPファイルで全ての日付のPNGをまとめてダウンロード
     - ファイル名: `thumbnail_YYYYMMDD.png` (各日付)
     - ZIPファイル名: `thumbnails_YYYYMMDD-YYYYMMDD.zip`
6. ダイアログを閉じて編集画面に戻る

#### 2.6.2 プレビュー機能

**リアルタイムプレビュー**:
- 編集中、常にキャンバスにプレビュー表示
- 変更が即座に反映
- レイヤーの選択状態を視覚的に表示（枠線等）

**生成プレビュー**:
- 実際の日付を適用したプレビュー
- 最終出力と同じ見た目
- ズーム可能
- 一時調整の反映

---

### 2.7 ショートカットキー

#### 2.7.1 カスタマイズ可能

- ユーザーが任意のキーバインドを設定可能
- 設定UI（モーダルダイアログ）:
  - アクション一覧
  - 現在のキーバインド表示
  - クリックして新しいキーを入力
  - デフォルトに戻すボタン
- 設定はlocalStorageに保存

#### 2.7.2 デフォルトショートカット

**ファイル操作**:
- `Ctrl/Cmd + S`: プリセット名変更ダイアログを開く
- `Ctrl/Cmd + Shift + S`: 別名で保存
- `Ctrl/Cmd + E`: エクスポート
- `Ctrl/Cmd + I`: インポート
- `Ctrl/Cmd + N`: 新規プリセット

**編集操作**:
- `Ctrl/Cmd + Z`: 元に戻す
- `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y`: やり直し
- `Ctrl/Cmd + C`: レイヤーコピー
- `Ctrl/Cmd + V`: レイヤーペースト
- `Ctrl/Cmd + D`: レイヤー複製
- `Delete` or `Backspace`: 選択レイヤー削除

**レイヤー操作**:
- `Ctrl/Cmd + ]`: レイヤーを前面へ
- `Ctrl/Cmd + [`: レイヤーを背面へ
- `Ctrl/Cmd + Shift + ]`: 最前面へ
- `Ctrl/Cmd + Shift + [`: 最背面へ

**移動操作**:
- `矢印キー`: レイヤー移動（1px）
- `Shift + 矢印キー`: レイヤー移動（10px）

**表示操作**:
- `Ctrl/Cmd + ;`: グリッド表示切り替え
- `Ctrl/Cmd + '`: ガイド表示切り替え
- `Ctrl/Cmd + R`: ルーラー表示切り替え
- `Space + ドラッグ`: キャンバスパン（移動）
- `Ctrl/Cmd + 0`: ズームをリセット（100%）
- `Ctrl/Cmd + +`: ズームイン
- `Ctrl/Cmd + -`: ズームアウト

**その他**:
- `Ctrl/Cmd + G`: サムネイル生成ダイアログを開く
- `Tab`: 次のレイヤーを選択
- `Shift + Tab`: 前のレイヤーを選択

---

## 3. 非機能要件

### 3.1 パフォーマンス

- **初回ロード**: 3秒以内（Service Worker キャッシュ後は1秒以内）
- **レイヤー操作レスポンス**: 100ms以内
- **キャンバス再描画**: 60fps維持
- **PNG生成時間**: 
  - 1920x1080: 3秒以内
  - 3840x2160 (4K): 10秒以内
- **プリセット読み込み**: 1秒以内
- **プリセット保存**: 500ms以内

### 3.2 データ保存

**IndexedDB スキーマ**:

```typescript
// データベース名: hizuke-thumb
// バージョン: 1

// オブジェクトストア: presets
interface PresetRecord {
  id: string;                  // UUID
  name: string;                // ユーザーが保存時に指定（デフォルトはベース画像名）
  isDefault: boolean;
  createdAt: number;           // timestamp
  updatedAt: number;
  canvas: {
    width: number;
    height: number;
    baseImageId: string;       // → images ストアへの参照
  };
  layers: Layer[];             // 上記定義参照
  thumbnailId: string;         // → images ストアへの参照
}

// オブジェクトストア: images
interface ImageRecord {
  id: string;                  // UUID
  name: string;
  mimeType: string;
  data: Blob;                  // 画像バイナリ
  createdAt: number;
}

// オブジェクトストア: fonts
interface FontRecord {
  id: string;                  // UUID
  name: string;
  family: string;              // フォントファミリー名
  data: Blob;                  // フォントバイナリ
  createdAt: number;
}

// オブジェクトストア: settings
interface SettingsRecord {
  key: string;                 // 設定キー
  value: any;                  // 設定値
}
```

**容量制限**:
- プリセット1つあたり: 50MB以内を推奨
- 画像1枚あたり: 10MB以内を推奨
- フォント1つあたり: 5MB以内を推奨
- 合計ストレージ: ブラウザの制限に依存（通常数GB）

**データ整合性**:
- プリセット削除時、使用していない画像・フォントを自動削除
- 参照カウント管理

### 3.3 オフライン対応

**Service Worker 戦略**:

```typescript
// Cache-First 戦略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**キャッシュ対象**:
- HTML, CSS, JavaScript（全アプリケーションコード）
- アイコン、ロゴ等の静的アセット
- Webフォント（UI用）

**キャッシュ対象外**:
- ユーザーアップロード画像・フォント（IndexedDBに保存）
- 外部API（使用しない）

**更新戦略**:
- 新バージョンがあればバックグラウンドでダウンロード
- 「更新が利用可能です」通知を表示
- ユーザーがリロードすると新バージョンに切り替え

### 3.4 セキュリティ・プライバシー

- ✅ ユーザーデータは全てローカル（IndexedDB）に保存
- ✅ サーバーへのデータ送信なし
- ✅ 外部通信なし（完全クライアントサイド）
- ✅ トラッキングなし
- ✅ クッキー使用なし
- ✅ HTTPS必須（Service Worker要件）

---

## 4. UI/UX要件

### 4.1 画面構成

**メイン画面レイアウト**:

```
┌─────────────────────────────────────────────────────────┐
│  Header (ツールバー)                                     │
├─────────────────────────────┬───────────────────────────┤
│                             │                           │
│   Canvas Editor             │  Properties Panel (上部)  │
│   (中央・最大エリア)         │                           │
│                             │  ┌─────────────────────┐ │
│                             │  │ 選択レイヤーの      │ │
│                             │  │ プロパティ          │ │
│                             │  └─────────────────────┘ │
│                             │                           │
│                             │  Layer Panel (下部)       │
│   Flexible                  │  ┌─────────────────────┐ │
│                             │  │ レイヤー一覧        │ │
│                             │  │                     │ │
│                             │  └─────────────────────┘ │
│                             │                           │
│                             │  320px                    │
└─────────────────────────────┴───────────────────────────┘
```

**Header (ツールバー)**:
- 左: アプリ名（ひづけサムネ）・ロゴ
- 中央: プリセット選択ドロップダウン
- 右: 
  - 保存ステータス（自動保存中/保存済み）
  - 「名前を付けて保存」ボタン
  - エクスポート/インポートボタン
  - 設定ボタン
  - 「サムネイルを生成」ボタン（強調）

**Canvas Editor (中央エリア)**:
- ツールバー（上部）:
  - ズームコントロール
  - グリッド・ガイド・ルーラー切り替え
  - スナップ切り替え
  - 元に戻す/やり直し
- キャンバス表示エリア:
  - チェッカーボード背景（透明部分の表示）
  - レイヤー表示
  - 選択レイヤーのバウンディングボックス
- ステータスバー（下部）:
  - マウス座標表示
  - キャンバスサイズ表示
  - ズーム率表示

**右サイドバー**:
- 折りたたみ可能
- 上部: **Properties Panel**（選択レイヤーのプロパティ）
- 下部: **Layer Panel**（レイヤー一覧）

**Properties Panel (右上)**:
- 選択レイヤーのプロパティを表示
- レイヤータイプに応じて内容が変わる:
  - 画像レイヤー: 位置、サイズ、不透明度
  - テキストレイヤー: 位置、テキスト内容、書式設定
- アコーディオン形式（セクション毎に折りたたみ）

**Layer Panel (右下)**:
- レイヤー追加ボタン（画像・テキスト）
- レイヤーリスト（スクロール可能）
- 各レイヤーアイテム:
  - サムネイル
  - レイヤー名
  - 表示/非表示トグル
  - ロックトグル

### 4.2 プリセット選択画面

モーダルダイアログ:

```svelte
<PresetSelector>
  <div class="preset-grid">
    {#each presets as preset}
      <PresetCard
        {preset}
        onselect={() => loadPreset(preset.id)}
        ondelete={() => deletePreset(preset.id)}
        onduplicate={() => duplicatePreset(preset.id)}
      />
    {/each}
    <NewPresetCard onclick={createNewPreset} />
  </div>
</PresetSelector>
```

各プリセットカード:
- サムネイル画像（300x200px程度）
- プリセット名
- 最終更新日時
- デフォルトバッジ（該当する場合）
- ホバー時にアクションボタン表示:
  - 選択
  - 編集（名前変更）
  - 複製
  - 削除
  - デフォルトに設定

### 4.3 プリセット保存ダイアログ

`Ctrl/Cmd + S` または「名前を付けて保存」ボタンで表示:

```svelte
<PresetSaveDialog>
  <h2>プリセットを保存</h2>
  <label>
    プリセット名:
    <input type="text" bind:value={presetName} placeholder="例: 配信サムネイル" />
  </label>
  <div class="actions">
    <button onclick={save}>保存</button>
    <button onclick={cancel}>キャンセル</button>
  </div>
</PresetSaveDialog>
```

### 4.4 生成プレビュー画面

モーダルダイアログ:

```svelte
<GenerationDialog>
  <div class="dialog-layout">
    <div class="preview-area">
      <CanvasPreview {generatedImage} />
      <!-- 一時調整用のコントロール -->
      
      <!-- 複数日付の場合: 日付ナビゲーション -->
      {#if selectedDates.length > 1}
        <div class="date-navigation">
          <button onclick={previousDate}>← 前の日付</button>
          <span>{currentDateIndex + 1} / {selectedDates.length}</span>
          <button onclick={nextDate}>次の日付 →</button>
        </div>
      {/if}
    </div>
    
    <div class="controls-area">
      <!-- 日付選択モード切り替え -->
      <div class="mode-toggle">
        <button class:active={mode === 'single'} onclick={() => mode = 'single'}>
          単一日付
        </button>
        <button class:active={mode === 'multiple'} onclick={() => mode = 'multiple'}>
          複数日付
        </button>
      </div>
      
      <!-- 日付選択UI -->
      {#if mode === 'single'}
        <DatePicker bind:selectedDate />
      {:else}
        <DateRangePicker bind:selectedDates />
        <div class="selected-dates-list">
          {#each selectedDates as date}
            <span class="date-chip">
              {formatDate(date, 'yyyy/MM/dd')}
              <button onclick={() => removeDate(date)}>×</button>
            </span>
          {/each}
        </div>
      {/if}
      
      <!-- 動的テキストレイヤーの一覧 -->
      {#each dateTextLayers as layer}
        <div class="layer-preview">
          <span>{layer.name}</span>
          <span class="preview-text">
            {generateText(layer, currentPreviewDate)}
          </span>
        </div>
      {/each}
      
      <div class="actions">
        <button onclick={download}>
          {selectedDates.length > 1 ? `${selectedDates.length}件をダウンロード` : 'ダウンロード'}
        </button>
        <button variant="secondary" onclick={saveAdjustments}>
          調整を恒久的に保存
        </button>
        <button variant="ghost" onclick={cancel}>キャンセル</button>
      </div>
    </div>
  </div>
</GenerationDialog>
```

### 4.5 カラースキーム

- ダークモード対応（デフォルト）
- ライトモード切り替え可能
- システム設定に追従オプション

**カラーパレット例（ダークモード）**:

```css
:root {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2a2a2a;
  --bg-tertiary: #3a3a3a;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --border: #404040;
  --accent: #3b82f6;
  --accent-hover: #2563eb;
  --danger: #ef4444;
  --success: #10b981;
}
```

### 4.6 レスポンシブ対応

- **デスクトップ優先設計** (1024px以上)
- タブレット対応 (768px-1023px):
  - サイドバーを折りたたみ可能に
  - プロパティパネルをモーダル化
- スマートフォン: 対応しない（画面サイズ不足）
  - 768px未満でアクセス時は警告メッセージ表示

---

## 5. 将来の拡張性への配慮

### 5.1 Svelte 5 Runes を活用した設計

**状態管理例**:

```typescript
// lib/state/layers.svelte.ts
import type { Layer } from '$lib/types';

class LayerState {
  layers = $state<Layer[]>([]);
  selectedLayerId = $state<string | null>(null);
  
  // 派生状態（$derived ルーン使用）
  selectedLayer = $derived(
    this.layers.find(l => l.id === this.selectedLayerId) ?? null
  );
  
  visibleLayers = $derived(
    this.layers.filter(l => l.visible)
  );
  
  // メソッド
  addLayer(layer: Layer) {
    this.layers = [...this.layers, layer];
  }
  
  removeLayer(id: string) {
    this.layers = this.layers.filter(l => l.id !== id);
  }
  
  moveLayer(id: string, delta: { x: number; y: number }) {
    this.layers = this.layers.map(l =>
      l.id === id
        ? { ...l, position: { x: l.position.x + delta.x, y: l.position.y + delta.y } }
        : l
    );
  }
}

export const layerState = new LayerState();
```

**コンポーネントでの使用**:

```svelte
<script lang="ts">
  import { layerState } from '$lib/state/layers.svelte';
  
  // Runes で自動的にリアクティブ
  const { layers, selectedLayer } = layerState;
</script>

<div>
  <p>選択中: {selectedLayer?.name ?? 'なし'}</p>
  
  {#each layers as layer}
    <div>{layer.name}</div>
  {/each}
</div>
```

### 5.2 テキストコンテンツタイプの拡張設計

```typescript
// lib/types/layer.ts

// 静的テキスト
export type StaticTextContent = {
  type: 'static';
  value: string;
};

// 日付テキスト
export type DateTextContent = {
  type: 'date';
  format: string;
  locale: 'ja' | 'en';
};

// 将来追加される場合の例
/*
export type CustomTextContent = {
  type: 'custom';
  template: string;
  variables: Record<string, any>;
};
*/

export type TextContent = StaticTextContent | DateTextContent; // | CustomTextContent;

// レンダラーの型安全な実装
export const textRenderers = {
  'static': (content: StaticTextContent) => content.value,
  'date': (content: DateTextContent, context: { date: Date }) => {
    return formatDate(context.date, content.format, content.locale);
  },
  // 将来追加:
  // 'custom': (content: CustomTextContent, context) => { ... }
} as const;

// 汎用レンダリング関数（型安全）
export function renderTextContent(content: TextContent, context: { date: Date }): string {
  switch (content.type) {
    case 'static':
      return textRenderers.static(content);
    case 'date':
      return textRenderers.date(content, context);
    // 将来追加時はここにケースを追加
  }
}
```

### 5.3 Canvas Engine の抽象化

```typescript
// lib/canvas/CanvasEngine.ts

export class CanvasEngine {
  private ctx: CanvasRenderingContext2D;
  
  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
  }
  
  // プラットフォーム非依存の描画API
  render(layers: Layer[]): void {
    this.clear();
    
    // Z-indexでソート
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    
    for (const layer of sortedLayers) {
      if (!layer.visible) continue;
      
      if (layer.type === 'image') {
        this.renderImage(layer as ImageLayer);
      } else if (layer.type === 'text') {
        this.renderText(layer as TextLayer);
      }
    }
  }
  
  private renderImage(layer: ImageLayer): void {
    // 画像描画ロジック
  }
  
  private renderText(layer: TextLayer): void {
    // テキスト描画ロジック（アウトライン、シャドウ含む）
  }
  
  private clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }
}
```

### 5.4 スマートフォン対応の準備

**タッチイベント対応の抽象化**:

```typescript
// lib/utils/input.ts

export interface PointerEvent {
  x: number;
  y: number;
  type: 'start' | 'move' | 'end';
}

export class InputHandler {
  handlePointerDown(e: MouseEvent | TouchEvent): PointerEvent {
    const point = 'touches' in e ? e.touches[0] : e;
    return {
      x: point.clientX,
      y: point.clientY,
      type: 'start'
    };
  }
  
  handlePointerMove(e: MouseEvent | TouchEvent): PointerEvent {
    const point = 'touches' in e ? e.touches[0] : e;
    return {
      x: point.clientX,
      y: point.clientY,
      type: 'move'
    };
  }
  
  handlePointerUp(e: MouseEvent | TouchEvent): PointerEvent {
    const point = 'changedTouches' in e ? e.changedTouches[0] : e;
    return {
      x: point.clientX,
      y: point.clientY,
      type: 'end'
    };
  }
}
```

---

## 6. 開発ロードマップ

### Phase 1: コア機能（MVP）

- [x] プロジェクト要件定義
- [x] プロジェクトセットアップ（Vite + Svelte 5 + TypeScript + Bun）
- [x] 基本UI構築（レイアウト、右サイドバー、ヘッダー）
- [x] IndexedDB 実装（プリセット、画像、フォント）
- [x] Canvas Engine 実装（基本描画）
- [x] レイヤー管理（追加、削除、並び替え）
- [x] 画像レイヤー（アップロード、表示）
- [x] テキストレイヤー（静的テキスト、基本書式）
- [x] プリセット保存・読み込み（自動保存 + 名前付け保存）
- [x] PNG エクスポート

### Phase 2: テキスト機能

- [x] フォント管理（アップロード、IndexedDB保存）
- [x] テキスト詳細書式（アウトライン、シャドウ等）
- [x] 動的テキスト（日付）
- [x] 日付フォーマット（プリセット + カスタム + 言語選択）
- [x] 複数日付選択機能
- [x] 複数日付の一括生成・ZIP出力

### Phase 3: UX改善

- [ ] ドラッグ&ドロップでレイヤー移動
- [ ] 元に戻す/やり直し
- [ ] キーボードショートカット
- [ ] グリッド・ガイド・ルーラー
- [ ] ズーム機能
- [ ] レイヤープレビュー

### Phase 4: 高度な機能

- [ ] プリセット選択UI
- [ ] エクスポート/インポート
- [ ] 生成プレビューダイアログ
- [ ] 一時的調整モード
- [ ] ショートカットカスタマイズ
- [ ] ダークモード/ライトモード

### Phase 5: 最適化

- [ ] Service Worker (PWA対応)
- [ ] Web Worker (画像処理)
- [ ] パフォーマンスチューニング
- [ ] テスト追加（Vitest）

### Phase 6（将来）: 拡張機能

- [ ] 新しいテキストコンテンツタイプ追加
- [ ] レイヤーグループ化
- [ ] トランスフォーム（回転、スケール）
- [ ] スマートフォン対応（簡易版）

---

## 7. 技術仕様詳細

### 7.1 package.json

```json
{
  "name": "hizuke-thumb",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-check --tsconfig ./tsconfig.json",
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "dexie": "^4.0.0",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "@tsconfig/svelte": "^5.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "svelte": "^5.0.0",
    "svelte-check": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "tslib": "^2.6.0",
    "typescript": "^5.5.0",
    "vite": "^7.0.0",
    "vite-plugin-pwa": "^1.0.0",
    "vitest": "^4.0.0"
  }
}
```

### 7.2 主要設定ファイル

**vite.config.ts**:

```typescript
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'ひづけサムネ',
        short_name: 'ひづけサムネ',
        description: '配信・動画サムネイル作成支援ツール',
        theme_color: '#1a1a1a',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '$lib': '/src/lib',
      '$components': '/src/components'
    }
  }
});
```

**svelte.config.js**:

```javascript
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: true  // Svelte 5 Runes を有効化
  }
};
```

**tailwind.config.js**:

```javascript
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#1a1a1a',
        'bg-secondary': '#2a2a2a',
        'bg-tertiary': '#3a3a3a',
        'text-primary': '#ffffff',
        'text-secondary': '#b0b0b0',
        'accent': '#3b82f6',
      }
    }
  },
  plugins: []
};
```

**bunfig.toml** (オプション):

```toml
[install]
# パッケージインストール設定
cache = true
registry = "https://registry.npmjs.org/"
frozenLockfile = false

[test]
# Vitest用（Bunのネイティブテストランナーは使用しない）
preload = []
```

**tsconfig.json**:

```json
{
  "extends": "@tsconfig/svelte/tsconfig.json",
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "$lib": ["./src/lib"],
      "$lib/*": ["./src/lib/*"],
      "$components": ["./src/components"],
      "$components/*": ["./src/components/*"]
    }
  },
  "include": ["src/**/*.d.ts", "src/**/*.ts", "src/**/*.js", "src/**/*.svelte"],
  "exclude": ["node_modules"]
}
```

### 7.3 開発コマンド

```bash
# 初回セットアップ
bun install

# 開発サーバー起動
bun dev

# 型チェック
bun run check

# テスト実行（Vitest）
bun test

# テストUI
bun test:ui

# プロダクションビルド
bun build

# プレビュー
bun preview
```

### 7.4 プロジェクトセットアップ手順

```bash
# 1. Bunのインストール（まだの場合）
curl -fsSL https://bun.sh/install | bash

# 2. プロジェクト作成
mkdir hizuke-thumb
cd hizuke-thumb

# 3. package.json作成（上記の内容で作成）

# 4. 依存関係インストール
bun install

# 5. 設定ファイル作成
# - vite.config.ts
# - svelte.config.js
# - tailwind.config.js
# - tsconfig.json

# 6. 開発開始
bun dev
```

### 7.5 CI/CD設定（GitHub Actions）

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Bun
      uses: oven-sh/setup-bun@v1
      with:
        bun-version: latest
    
    - name: Install dependencies
      run: bun install --frozen-lockfile
    
    - name: Run type check
      run: bun run check
    
    - name: Run tests (Vitest)
      run: bun test
    
    - name: Build
      run: bun run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: dist
        path: dist/
```

### 7.6 .gitignore

```gitignore
# Bun
node_modules
bun.lockb

# Build output
dist/
.svelte-kit/

# Environment
.env
.env.*

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Test
coverage/

# Logs
*.log
```

---

## 付録: 重要な実装ポイント

### A. IndexedDB実装のベストプラクティス

```typescript
// lib/storage/indexeddb.ts
import Dexie, { type EntityTable } from 'dexie';
import type { PresetRecord, ImageRecord, FontRecord, SettingsRecord } from '$lib/types';

const DB_NAME = 'hizuke-thumb';
const DB_VERSION = 1;

// データベーススキーマの型定義
export class HizukeThumbDB extends Dexie {
  presets!: EntityTable<PresetRecord, 'id'>;
  images!: EntityTable<ImageRecord, 'id'>;
  fonts!: EntityTable<FontRecord, 'id'>;
  settings!: EntityTable<SettingsRecord, 'key'>;

  constructor() {
    super(DB_NAME);
    
    this.version(DB_VERSION).stores({
      presets: 'id, name, isDefault, updatedAt',
      images: 'id, name, createdAt',
      fonts: 'id, name, family, createdAt',
      settings: 'key'
    });
  }
}

// シングルトンインスタンス
export const db = new HizukeThumbDB();

// 使用例
export async function savePreset(preset: PresetRecord): Promise<string> {
  return await db.presets.put(preset);
}

export async function getPreset(id: string): Promise<PresetRecord | undefined> {
  return await db.presets.get(id);
}

export async function getAllPresets(): Promise<PresetRecord[]> {
  return await db.presets.orderBy('updatedAt').reverse().toArray();
}

export async function deletePreset(id: string): Promise<void> {
  await db.presets.delete(id);
}
```

### B. Canvas描画のパフォーマンス最適化

```typescript
// lib/canvas/CanvasEngine.ts
export class CanvasEngine {
  private offscreenCanvas: OffscreenCanvas | null = null;
  
  // オフスクリーンキャンバスを使った描画
  async renderOffscreen(layers: Layer[]): Promise<Blob> {
    if (!this.offscreenCanvas) {
      this.offscreenCanvas = new OffscreenCanvas(
        this.ctx.canvas.width,
        this.ctx.canvas.height
      );
    }
    
    const offscreenCtx = this.offscreenCanvas.getContext('2d')!;
    
    // 描画処理
    this.renderToContext(offscreenCtx, layers);
    
    return await this.offscreenCanvas.convertToBlob({ type: 'image/png' });
  }
}
```

### C. Svelte 5 Runesの効果的な使用

```typescript
// lib/state/canvas.svelte.ts
class CanvasState {
  // 状態
  zoom = $state(1.0);
  panOffset = $state({ x: 0, y: 0 });
  showGrid = $state(false);
  showGuides = $state(true);
  showRuler = $state(true);
  
  // 派生状態（$derived ルーン使用）
  viewTransform = $derived({
    scale: this.zoom,
    translateX: this.panOffset.x,
    translateY: this.panOffset.y
  });
  
  // アクション
  setZoom(zoom: number) {
    this.zoom = Math.max(0.25, Math.min(4.0, zoom));
  }
  
  resetView() {
    this.zoom = 1.0;
    this.panOffset = { x: 0, y: 0 };
  }
}

export const canvasState = new CanvasState();
```

---

## 終わりに

この要件定義書は、「ひづけサムネ (hizuke-thumb)」の完全な仕様を記述しています。開発を開始する際は、Phase 1から順番に実装していくことを推奨します。

質問や不明点があれば、各セクションを参照してください。
