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

// UUID生成
export function generateId(): string {
  return crypto.randomUUID();
}
