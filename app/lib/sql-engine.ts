import alasql from 'alasql';
import type { Dataset } from '../types/dataset';
import type { QueryResult } from '../types/query';

export interface SqlExecutionError {
  message: string;
  suggestion?: string;
  originalError?: any;
}

/**
 * Prepares and registers all datasets in AlaSQL.
 * Ensures the currently active dataset is accessible as both its tableName and 'data'.
 */
export function registerDatasetsInEngine(datasets: Dataset[], activeDatasetId?: string) {
  try {
    // Clear existing tables in alasql default database
    for (const tableName of Object.keys(alasql.tables || {})) {
      delete (alasql.tables as any)[tableName];
    }

    const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];

    for (const ds of datasets) {
      // Register with ds.tableName
      (alasql.tables as any)[ds.tableName] = {
        data: ds.rows,
      };
    }

    // Register active dataset as 'data' alias if not already named 'data'
    if (activeDataset) {
      (alasql.tables as any)['data'] = {
        data: activeDataset.rows,
      };
    }
  } catch (err) {
    console.warn('Failed to register datasets in AlaSQL engine:', err);
  }
}

/**
 * Runs a SQL query against the in-memory AlaSQL engine.
 * Never uploads any data. 100% in-browser execution.
 */
export async function executeSqlQuery(
  sqlQuery: string,
  datasets: Dataset[],
  activeDatasetId?: string
): Promise<{ result?: QueryResult; error?: SqlExecutionError }> {
  const trimmed = sqlQuery.trim();
  if (!trimmed) {
    return {
      error: {
        message: 'Query is empty. Please enter a SQL query, e.g. SELECT * FROM data LIMIT 10;',
      },
    };
  }

  // Ensure tables are synchronized
  registerDatasetsInEngine(datasets, activeDatasetId);

  const startTime = performance.now();

  try {
    // Remove trailing semicolon if present
    const cleanSql = trimmed.replace(/;+\s*$/, '');

    const res = alasql(cleanSql);
    const endTime = performance.now();
    const executionTimeMs = Math.round((endTime - startTime) * 100) / 100;

    let rows: Record<string, any>[] = [];
    if (Array.isArray(res)) {
      // If query returned array of objects or primitives
      if (res.length > 0 && (typeof res[0] !== 'object' || res[0] === null)) {
        rows = res.map((v) => ({ result: v }));
      } else {
        rows = res;
      }
    } else if (res && typeof res === 'object') {
      rows = [res];
    } else if (res !== undefined) {
      rows = [{ value: res }];
    }

    // Extract columns
    const columnSet = new Set<string>();
    for (let i = 0; i < Math.min(rows.length, 500); i++) {
      const r = rows[i];
      if (r && typeof r === 'object') {
        for (const k of Object.keys(r)) {
          columnSet.add(k);
        }
      }
    }

    const columns = Array.from(columnSet);

    return {
      result: {
        columns,
        rows,
        executionTimeMs,
        rowCount: rows.length,
        timestamp: Date.now(),
        sql: sqlQuery,
      },
    };
  } catch (err: any) {
    const errorMsg = err?.message || String(err) || 'Query execution failed.';
    let suggestion: string | undefined;

    // Diagnose common mistakes
    const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];
    const availableCols = activeDataset ? activeDataset.columns.map((c) => c.key) : [];

    // Check if error mentions an unknown column or property
    const colMatch = errorMsg.match(/column "(.*?)" does not exist/i) ||
                     errorMsg.match(/unknown column:?\s*['"]?([a-zA-Z0-9_.]+)['"]?/i) ||
                     errorMsg.match(/can't find property:?\s*['"]?([a-zA-Z0-9_.]+)['"]?/i);

    if (colMatch && colMatch[1]) {
      const queriedCol = colMatch[1];
      const closest = availableCols.find(
        (c) => c.toLowerCase() === queriedCol.toLowerCase() ||
               c.toLowerCase().includes(queriedCol.toLowerCase())
      );
      if (closest) {
        suggestion = `Did you mean column "${closest}"? Check the available columns in the Schema section.`;
      } else {
        suggestion = `Check the available columns in the Schema section. Available: ${availableCols.slice(0, 5).join(', ')}${availableCols.length > 5 ? '...' : ''}`;
      }
    } else if (/table (.*?) does not exist/i.test(errorMsg) || /can't find table/i.test(errorMsg)) {
      const tableNames = ['data', ...datasets.map((d) => d.tableName)];
      suggestion = `Available table names: ${tableNames.map((t) => `"${t}"`).join(', ')}. Use "FROM data" for the current dataset.`;
    } else if (/syntax/i.test(errorMsg)) {
      suggestion = 'Check SQL syntax. Columns with dots (e.g. address.city) can be enclosed in backticks or square brackets, e.g. `address.city` or [address.city].';
    }

    return {
      error: {
        message: errorMsg,
        suggestion,
        originalError: err,
      },
    };
  }
}
