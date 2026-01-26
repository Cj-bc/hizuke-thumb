<script lang="ts">
  import { eachDayOfInterval, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
  import { ja } from 'date-fns/locale';

  interface Props {
    selectedDates?: Date[];
    onchange?: (dates: Date[]) => void;
  }

  let {
    selectedDates = $bindable([]),
    onchange,
  }: Props = $props();

  let currentMonth = $state(new Date());

  // カレンダーの日付を計算
  const calendarDays = $derived(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  });

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  function isSelected(date: Date): boolean {
    return selectedDates.some(d => isSameDay(d, date));
  }

  function toggleDate(date: Date) {
    if (isSelected(date)) {
      selectedDates = selectedDates.filter(d => !isSameDay(d, date));
    } else {
      selectedDates = [...selectedDates, date].sort((a, b) => a.getTime() - b.getTime());
    }
    onchange?.(selectedDates);
  }

  function prevMonth() {
    currentMonth = subMonths(currentMonth, 1);
  }

  function nextMonth() {
    currentMonth = addMonths(currentMonth, 1);
  }

  function selectRange() {
    if (selectedDates.length < 2) return;

    const start = selectedDates[0];
    const end = selectedDates[selectedDates.length - 1];
    const allDates = eachDayOfInterval({ start, end });
    selectedDates = allDates;
    onchange?.(selectedDates);
  }

  function clearAll() {
    selectedDates = [];
    onchange?.(selectedDates);
  }

  // 日付範囲入力用
  let startDateInput = $state('');
  let endDateInput = $state('');

  function handleRangeInput() {
    if (!startDateInput || !endDateInput) return;

    const start = new Date(startDateInput);
    const end = new Date(endDateInput);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
    if (start > end) return;

    const allDates = eachDayOfInterval({ start, end });
    selectedDates = allDates;
    onchange?.(selectedDates);
  }
</script>

<div class="space-y-4">
  <!-- 日付範囲入力 -->
  <div class="bg-bg-tertiary p-3 rounded">
    <p class="text-xs text-text-secondary mb-2">日付範囲で選択</p>
    <div class="flex gap-2 items-center">
      <input
        type="date"
        bind:value={startDateInput}
        class="flex-1 px-2 py-1 text-sm bg-bg-secondary border border-border rounded text-text-primary"
      />
      <span class="text-text-secondary">〜</span>
      <input
        type="date"
        bind:value={endDateInput}
        class="flex-1 px-2 py-1 text-sm bg-bg-secondary border border-border rounded text-text-primary"
      />
      <button
        class="px-3 py-1 text-sm bg-accent hover:bg-accent-hover text-white rounded"
        onclick={handleRangeInput}
      >
        適用
      </button>
    </div>
  </div>

  <!-- カレンダー -->
  <div class="bg-bg-tertiary p-3 rounded">
    <!-- ヘッダー -->
    <div class="flex items-center justify-between mb-3">
      <button
        class="p-1 hover:bg-border rounded"
        onclick={prevMonth}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="font-medium">
        {format(currentMonth, 'yyyy年M月', { locale: ja })}
      </span>
      <button
        class="p-1 hover:bg-border rounded"
        onclick={nextMonth}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- 曜日ヘッダー -->
    <div class="grid grid-cols-7 gap-1 mb-1">
      {#each weekDays as day, i}
        <div class="text-center text-xs text-text-secondary py-1 {i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}">
          {day}
        </div>
      {/each}
    </div>

    <!-- 日付グリッド -->
    <div class="grid grid-cols-7 gap-1">
      {#each calendarDays() as date}
        {@const isCurrentMonth = isSameMonth(date, currentMonth)}
        {@const selected = isSelected(date)}
        {@const isToday = isSameDay(date, new Date())}
        {@const dayOfWeek = date.getDay()}
        <button
          class="aspect-square flex items-center justify-center text-sm rounded transition-colors
            {selected ? 'bg-accent text-white' : 'hover:bg-border'}
            {!isCurrentMonth ? 'text-text-secondary opacity-40' : ''}
            {isToday && !selected ? 'ring-1 ring-accent' : ''}
            {dayOfWeek === 0 && !selected ? 'text-red-400' : ''}
            {dayOfWeek === 6 && !selected ? 'text-blue-400' : ''}"
          onclick={() => toggleDate(date)}
        >
          {format(date, 'd')}
        </button>
      {/each}
    </div>
  </div>

  <!-- 選択アクション -->
  <div class="flex gap-2">
    <button
      class="flex-1 px-3 py-1.5 text-sm bg-bg-tertiary hover:bg-border rounded"
      onclick={selectRange}
      disabled={selectedDates.length < 2}
    >
      範囲を埋める
    </button>
    <button
      class="flex-1 px-3 py-1.5 text-sm bg-bg-tertiary hover:bg-border rounded"
      onclick={clearAll}
    >
      すべてクリア
    </button>
  </div>

  <!-- 選択数表示 -->
  {#if selectedDates.length > 0}
    <div class="text-sm text-text-secondary">
      {selectedDates.length}日を選択中
    </div>
  {/if}
</div>
