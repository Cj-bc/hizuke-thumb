<script lang="ts">
  import { Input, Dropdown, ColorPicker, Slider, Checkbox } from '$components/ui';
  import { layerState, presetState } from '$lib/state';
  import { getAllFonts, uploadFont } from '$lib/storage';
  import { DATE_FORMAT_PRESETS, previewFormat, type DateLocale } from '$lib/utils';
  import type { TextLayer, TextContent, FontRecord } from '$lib/types';
  import { onMount } from 'svelte';

  interface Props {
    layer: TextLayer;
  }

  let { layer }: Props = $props();

  let fonts = $state<FontRecord[]>([]);

  onMount(async () => {
    fonts = await getAllFonts();
  });

  function updatePosition(axis: 'x' | 'y', value: number) {
    layerState.setLayerPosition(layer.id, {
      ...layer.position,
      [axis]: value,
    });
    presetState.triggerAutoSave();
  }

  function updateContent(updates: Partial<TextContent>) {
    const newContent = { ...layer.content, ...updates } as TextContent;
    layerState.updateTextLayer(layer.id, { content: newContent });
    presetState.triggerAutoSave();
  }

  function updateStyle(updates: Parameters<typeof layerState.updateTextStyle>[1]) {
    layerState.updateTextStyle(layer.id, updates);
    presetState.triggerAutoSave();
  }

  function setContentType(type: 'static' | 'date') {
    let newContent: TextContent;
    if (type === 'static') {
      newContent = { type: 'static', value: layer.content.type === 'static' ? layer.content.value : 'テキスト' };
    } else {
      newContent = { type: 'date', format: 'yyyy/MM/dd', locale: 'ja' };
    }
    layerState.updateTextLayer(layer.id, { content: newContent });
    presetState.triggerAutoSave();
  }

  async function handleUploadFont() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ttf,.otf,.woff,.woff2';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const fontRecord = await uploadFont(file);
        fonts = await getAllFonts();
        updateStyle({ fontId: fontRecord.id });
      }
    };
    input.click();
  }

  const fontOptions = $derived(
    fonts.map(f => ({ value: f.id, label: f.family }))
  );

  const alignOptions = [
    { value: 'left', label: '左揃え' },
    { value: 'center', label: '中央揃え' },
    { value: 'right', label: '右揃え' },
  ];

  const localeOptions = [
    { value: 'ja', label: '日本語' },
    { value: 'en', label: '英語' },
  ];

  // Filter date format presets by locale (only used when content.type === 'date')
  const filteredDatePresets = $derived(() => {
    if (layer.content.type === 'date') {
      const dateContent = layer.content as { type: 'date'; format: string; locale: 'ja' | 'en' };
      return DATE_FORMAT_PRESETS.filter(p => p.locale === dateContent.locale);
    }
    return [];
  });
</script>

<div class="space-y-4">
  <!-- 位置 -->
  <div>
    <h4 class="text-xs font-medium text-text-secondary mb-2">位置</h4>
    <div class="grid grid-cols-2 gap-2">
      <Input
        type="number"
        label="X"
        value={Math.round(layer.position.x)}
        oninput={(e) => updatePosition('x', Number((e.target as HTMLInputElement).value))}
      />
      <Input
        type="number"
        label="Y"
        value={Math.round(layer.position.y)}
        oninput={(e) => updatePosition('y', Number((e.target as HTMLInputElement).value))}
      />
    </div>
  </div>

  <!-- コンテンツタイプ -->
  <div>
    <h4 class="text-xs font-medium text-text-secondary mb-2">コンテンツ</h4>
    <div class="flex gap-2 mb-2">
      <button
        class="flex-1 px-3 py-1.5 rounded text-sm {layer.content.type === 'static' ? 'bg-accent text-white' : 'bg-bg-tertiary text-text-secondary'}"
        onclick={() => setContentType('static')}
      >
        固定テキスト
      </button>
      <button
        class="flex-1 px-3 py-1.5 rounded text-sm {layer.content.type === 'date' ? 'bg-accent text-white' : 'bg-bg-tertiary text-text-secondary'}"
        onclick={() => setContentType('date')}
      >
        日付
      </button>
    </div>

    {#if layer.content.type === 'static'}
      <Input
        label="テキスト"
        value={layer.content.value}
        oninput={(e) => updateContent({ value: (e.target as HTMLInputElement).value })}
      />
    {:else}
      <Dropdown
        label="言語"
        value={layer.content.locale}
        options={localeOptions}
        onchange={(value) => updateContent({ locale: value as DateLocale })}
      />
      <div class="mt-2">
        <Input
          label="フォーマット"
          value={layer.content.format}
          oninput={(e) => updateContent({ format: (e.target as HTMLInputElement).value })}
        />
        <p class="text-xs text-text-secondary mt-1">
          プレビュー: {previewFormat(layer.content.format, layer.content.locale)}
        </p>
      </div>
      <div class="mt-2 max-h-24 overflow-auto">
        <p class="text-xs text-text-secondary mb-1">プリセット:</p>
        <div class="flex flex-wrap gap-1">
          {#each filteredDatePresets() as preset}
            <button
              class="px-2 py-0.5 text-xs bg-bg-tertiary hover:bg-border rounded"
              onclick={() => updateContent({ format: preset.format })}
            >
              {preset.label}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- フォント -->
  <div>
    <h4 class="text-xs font-medium text-text-secondary mb-2">フォント</h4>
    <div class="flex gap-2 items-end">
      <div class="flex-1">
        <Dropdown
          label="フォント"
          value={layer.style.fontId}
          options={fontOptions}
          placeholder="フォントを選択"
          onchange={(value) => updateStyle({ fontId: value })}
        />
      </div>
      <button
        class="px-3 py-2 bg-bg-tertiary hover:bg-border rounded text-sm"
        onclick={handleUploadFont}
      >
        追加
      </button>
    </div>
  </div>

  <!-- サイズ -->
  <div>
    <Slider
      label="サイズ"
      value={layer.style.fontSize}
      min={8}
      max={200}
      unit="px"
      onchange={(value) => updateStyle({ fontSize: value })}
    />
  </div>

  <!-- 色 -->
  <div>
    <ColorPicker
      label="色"
      value={layer.style.color}
      onchange={(color) => updateStyle({ color })}
    />
  </div>

  <!-- 揃え -->
  <div>
    <Dropdown
      label="テキスト揃え"
      value={layer.style.align}
      options={alignOptions}
      onchange={(value) => updateStyle({ align: value as 'left' | 'center' | 'right' })}
    />
  </div>

  <!-- 書式 -->
  <div class="flex gap-4">
    <Checkbox
      label="太字"
      checked={layer.style.bold}
      onchange={(checked) => updateStyle({ bold: checked })}
    />
    <Checkbox
      label="斜体"
      checked={layer.style.italic}
      onchange={(checked) => updateStyle({ italic: checked })}
    />
  </div>

  <!-- アウトライン -->
  <div class="border-t border-border pt-4">
    <Checkbox
      label="アウトライン（縁取り）"
      checked={layer.style.outline?.enabled ?? false}
      onchange={(checked) => updateStyle({
        outline: { enabled: checked, width: layer.style.outline?.width ?? 2, color: layer.style.outline?.color ?? '#000000' }
      })}
    />
    {#if layer.style.outline?.enabled}
      <div class="mt-2 space-y-2 pl-6">
        <Slider
          label="太さ"
          value={layer.style.outline.width}
          min={1}
          max={20}
          unit="px"
          onchange={(value) => updateStyle({ outline: { ...layer.style.outline!, width: value } })}
        />
        <ColorPicker
          label="色"
          value={layer.style.outline.color}
          onchange={(color) => updateStyle({ outline: { ...layer.style.outline!, color } })}
        />
      </div>
    {/if}
  </div>

  <!-- シャドウ -->
  <div class="border-t border-border pt-4">
    <Checkbox
      label="ドロップシャドウ"
      checked={layer.style.shadow?.enabled ?? false}
      onchange={(checked) => updateStyle({
        shadow: {
          enabled: checked,
          offsetX: layer.style.shadow?.offsetX ?? 2,
          offsetY: layer.style.shadow?.offsetY ?? 2,
          blur: layer.style.shadow?.blur ?? 4,
          color: layer.style.shadow?.color ?? 'rgba(0,0,0,0.5)'
        }
      })}
    />
    {#if layer.style.shadow?.enabled}
      <div class="mt-2 space-y-2 pl-6">
        <div class="grid grid-cols-2 gap-2">
          <Input
            type="number"
            label="X オフセット"
            value={layer.style.shadow.offsetX}
            oninput={(e) => updateStyle({ shadow: { ...layer.style.shadow!, offsetX: Number((e.target as HTMLInputElement).value) } })}
          />
          <Input
            type="number"
            label="Y オフセット"
            value={layer.style.shadow.offsetY}
            oninput={(e) => updateStyle({ shadow: { ...layer.style.shadow!, offsetY: Number((e.target as HTMLInputElement).value) } })}
          />
        </div>
        <Slider
          label="ぼかし"
          value={layer.style.shadow.blur}
          min={0}
          max={50}
          unit="px"
          onchange={(value) => updateStyle({ shadow: { ...layer.style.shadow!, blur: value } })}
        />
        <ColorPicker
          label="色"
          value={layer.style.shadow.color}
          onchange={(color) => updateStyle({ shadow: { ...layer.style.shadow!, color } })}
        />
      </div>
    {/if}
  </div>
</div>
