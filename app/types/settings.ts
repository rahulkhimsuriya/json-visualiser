export type ThemeMode = 'light' | 'dark' | 'system';
export type RowDensity = 'compact' | 'standard' | 'relaxed';
export type NullDisplayFormat = '-' | 'null' | '(empty)';

export interface AppSettings {
  theme: ThemeMode;
  rowDensity: RowDensity;
  pageSize: number;
  nullDisplayFormat: NullDisplayFormat;
  showRowNumbers: boolean;
  defaultQueryLimit: number;
  autoFormatSql: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  rowDensity: 'standard',
  pageSize: 100,
  nullDisplayFormat: '-',
  showRowNumbers: true,
  defaultQueryLimit: 100,
  autoFormatSql: true,
};
