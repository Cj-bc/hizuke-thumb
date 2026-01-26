import { format } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';

const localeMap = {
  'ja': ja,
  'en': enUS
};

export type DateLocale = 'ja' | 'en';

/**
 * 日付をフォーマット文字列に従って整形する
 *
 * フォーマット文字列の構文:
 * - yyyy: 4桁年 (2024)
 * - yy:   2桁年 (24)
 * - MM:   2桁月・ゼロ埋め (01)
 * - M:    月 (1)
 * - dd:   2桁日・ゼロ埋め (09)
 * - d:    日 (9)
 * - EEEE: 曜日完全形 → 日本語: 火曜日 / 英語: Tuesday
 * - EEE:  曜日短縮形 → 日本語: 火 / 英語: Tue
 * - E:    曜日1文字 → 日本語: 火 / 英語: T
 * - MMMM: 月名完全形 → 日本語: 1月 / 英語: January
 * - MMM:  月名短縮形 → 日本語: 1月 / 英語: Jan
 */
export function formatDate(
  date: Date,
  formatString: string,
  locale: DateLocale = 'ja'
): string {
  return format(date, formatString, { locale: localeMap[locale] });
}

// デフォルトフォーマットプリセット
export interface DateFormatPreset {
  id: string;
  label: string;
  format: string;
  locale: DateLocale;
}

export const DATE_FORMAT_PRESETS: DateFormatPreset[] = [
  // 日本語フォーマット
  { id: 'ja-1', label: '2024/01/09', format: 'yyyy/MM/dd', locale: 'ja' },
  { id: 'ja-2', label: '2024.01.09', format: 'yyyy.MM.dd', locale: 'ja' },
  { id: 'ja-3', label: '2024-01-09', format: 'yyyy-MM-dd', locale: 'ja' },
  { id: 'ja-4', label: '2024年01月09日', format: 'yyyy年MM月dd日', locale: 'ja' },
  { id: 'ja-5', label: '1月9日', format: 'M月d日', locale: 'ja' },
  { id: 'ja-6', label: '2024/01/09 (火)', format: 'yyyy/MM/dd (EEE)', locale: 'ja' },
  { id: 'ja-7', label: '1/9 (火曜日)', format: 'M/d (EEEE)', locale: 'ja' },
  // 英語フォーマット
  { id: 'en-1', label: 'Jan 9, 2024', format: 'MMM d, yyyy', locale: 'en' },
  { id: 'en-2', label: 'January 9, 2024', format: 'MMMM d, yyyy', locale: 'en' },
  { id: 'en-3', label: '1/9/2024', format: 'M/d/yyyy', locale: 'en' },
  { id: 'en-4', label: 'Jan 9, 2024 (Tue)', format: 'MMM d, yyyy (EEE)', locale: 'en' },
  { id: 'en-5', label: 'January 9, 2024 (Tuesday)', format: 'MMMM d, yyyy (EEEE)', locale: 'en' },
];

// フォーマットのプレビュー生成
export function previewFormat(formatString: string, locale: DateLocale): string {
  // サンプル日付: 2024年1月9日（火曜日）
  const sampleDate = new Date(2024, 0, 9);
  try {
    return formatDate(sampleDate, formatString, locale);
  } catch {
    return '(無効なフォーマット)';
  }
}
