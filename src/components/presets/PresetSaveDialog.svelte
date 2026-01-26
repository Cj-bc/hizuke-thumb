<script lang="ts">
  import { Modal, Button, Input } from '$components/ui';
  import { presetState } from '$lib/state';

  interface Props {
    open: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  // Svelte 5.25+: $derived values can be bound and overridden by user input
  // When the source (currentPresetName) changes, it resets to the derived value
  let presetName = $derived(presetState.currentPresetName);
  let isSaveAs = $state(false);

  async function handleSave() {
    if (!presetName.trim()) return;

    if (isSaveAs) {
      await presetState.saveAs(presetName);
    } else {
      await presetState.rename(presetName);
      await presetState.save();
    }

    isSaveAs = false;
    open = false;
  }

  function handleCancel() {
    isSaveAs = false;
    open = false;
  }
</script>

<Modal {open} title="プリセットを保存" size="sm" onclose={handleCancel}>
  <div class="space-y-4">
    <Input
      label="プリセット名"
      bind:value={presetName}
      placeholder="例: 配信サムネイル"
    />

    <label class="flex items-center gap-2">
      <input
        type="checkbox"
        bind:checked={isSaveAs}
        class="rounded border-border bg-bg-tertiary text-accent focus:ring-accent"
      />
      <span class="text-sm text-text-primary">別名で保存（新しいプリセットを作成）</span>
    </label>

    <div class="flex justify-end gap-2">
      <Button variant="ghost" onclick={handleCancel}>
        キャンセル
      </Button>
      <Button variant="primary" onclick={handleSave} disabled={!presetName.trim()}>
        保存
      </Button>
    </div>
  </div>
</Modal>
