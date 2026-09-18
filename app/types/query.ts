export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  executionTimeMs: number;
  rowCount: number;
  timestamp: number;
  sql: string;
}

export interface QueryHistoryItem {
  id: string;
  sql: string;
  timestamp: number;
  executionTimeMs: number;
  rowCount: number;
  success: boolean;
  error?: string;
}

export interface SavedQuery {
  id: string;
  name: string;
  sql: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}
