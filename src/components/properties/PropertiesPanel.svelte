<script lang="ts">
  import ImageProperties from './ImageProperties.svelte';
  import TextProperties from './TextProperties.svelte';
  import { layerState, presetState } from '$lib/state';
</script>

<div class="p-4">
  <h3 class="text-sm font-semibold text-text-secondary mb-4">プロパティ</h3>

  {#if layerState.selectedLayer}
    {#if layerState.selectedLayer.type === 'image'}
      <ImageProperties layer={layerState.selectedLayer} />
    {:else if layerState.selectedLayer.type === 'text'}
      <TextProperties layer={layerState.selectedLayer} />
    {/if}
  {:else}
    <p class="text-text-secondary text-sm">
      レイヤーを選択してプロパティを編集
    </p>
  {/if}
</div>
