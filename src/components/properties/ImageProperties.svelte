<script lang="ts">
  import { Input, Slider } from '$components/ui';
  import { layerState, presetState } from '$lib/state';
  import type { ImageLayer } from '$lib/types';

  interface Props {
    layer: ImageLayer;
  }

  let { layer }: Props = $props();

  function updatePosition(axis: 'x' | 'y', value: number) {
    layerState.setLayerPosition(layer.id, {
      ...layer.position,
      [axis]: value,
    });
    presetState.triggerAutoSave();
  }

  function updateSize(dimension: 'width' | 'height', value: number) {
    layerState.updateImageLayer(layer.id, {
      size: { ...layer.size, [dimension]: value },
    });
    presetState.triggerAutoSave();
  }

  function updateOpacity(value: number) {
    layerState.updateImageLayer(layer.id, { opacity: value / 100 });
    presetState.triggerAutoSave();
  }
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

  <!-- サイズ -->
  <div>
    <h4 class="text-xs font-medium text-text-secondary mb-2">サイズ</h4>
    <div class="grid grid-cols-2 gap-2">
      <Input
        type="number"
        label="幅"
        value={Math.round(layer.size.width)}
        oninput={(e) => updateSize('width', Number((e.target as HTMLInputElement).value))}
      />
      <Input
        type="number"
        label="高さ"
        value={Math.round(layer.size.height)}
        oninput={(e) => updateSize('height', Number((e.target as HTMLInputElement).value))}
      />
    </div>
  </div>

  <!-- 不透明度 -->
  <div>
    <Slider
      label="不透明度"
      value={Math.round(layer.opacity * 100)}
      min={0}
      max={100}
      unit="%"
      onchange={updateOpacity}
    />
  </div>
</div>
