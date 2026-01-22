<script lang="ts">
  interface Props {
    value?: Date;
    onchange?: () => void;
  }

  let {
    value = $bindable(new Date()),
    onchange,
  }: Props = $props();

  function formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const newDate = new Date(target.value);
    if (!isNaN(newDate.getTime())) {
      value = newDate;
      onchange?.();
    }
  }

  // 曜日表示
  const dayOfWeek = $derived(() => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return days[value.getDay()];
  });
</script>

<div class="space-y-2">
  <input
    type="date"
    value={formatDateForInput(value)}
    oninput={handleInput}
    class="w-full px-3 py-2 bg-bg-tertiary border border-border rounded text-text-primary focus:border-accent focus:outline-none"
  />

  <div class="text-center">
    <span class="text-2xl font-bold text-text-primary">
      {value.getFullYear()}年{value.getMonth() + 1}月{value.getDate()}日
    </span>
    <span class="text-lg text-text-secondary ml-2">
      ({dayOfWeek()})
    </span>
  </div>

  <!-- クイック選択 -->
  <div class="flex gap-2 flex-wrap">
    <button
      class="px-2 py-1 text-xs bg-bg-tertiary hover:bg-border rounded"
      onclick={() => { value = new Date(); onchange?.(); }}
    >
      今日
    </button>
    <button
      class="px-2 py-1 text-xs bg-bg-tertiary hover:bg-border rounded"
      onclick={() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        value = tomorrow;
        onchange?.();
      }}
    >
      明日
    </button>
    <button
      class="px-2 py-1 text-xs bg-bg-tertiary hover:bg-border rounded"
      onclick={() => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        value = nextWeek;
        onchange?.();
      }}
    >
      1週間後
    </button>
  </div>
</div>
