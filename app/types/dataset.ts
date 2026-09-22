export type FieldType =
  | 'number'
  | 'decimal'
  | 'date'
  | 'datetime'
  | 'timestamp'
  | 'boolean'
  | 'string'
  | 'object'
  | 'array'
  | 'null';

export interface ColumnSchema {
  key: string;
  label: string;
  type: FieldType;
  nullable: boolean;
  nullCount: number;
  uniqueCount: number;
  sampleValues: any[];
  min?: number | string;
  max?: number | string;
  visible: boolean;
  width?: number;
}

export interface Dataset {
  id: string;
  name: string;
  tableName: string; // sanitized for SQL (e.g. users, orders, data)
  originalJson: string;
  rows: Record<string, any>[];
  columns: ColumnSchema[];
  rowCount: number;
  columnCount: number;
  createdAt: number;
  fileSize: number;
}

export type FilterCondition =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_equal'
  | 'less_equal'
  | 'is_empty'
  | 'is_not_empty';

export interface FilterRule {
  id: string;
  column: string;
  condition: FilterCondition;
  value: string;
}

export interface SortRule {
  column: string;
  direction: 'asc' | 'desc';
}
