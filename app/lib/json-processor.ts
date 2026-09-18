import type { ColumnSchema, Dataset, FieldType } from '../types/dataset';

export interface ParseErrorDetails {
  message: string;
  line?: number;
  column?: number;
  snippet?: string;
  suggestion?: string;
}

export function validateJsonString(raw: string): { isValid: boolean; error?: ParseErrorDetails } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: {
        message: 'JSON input is empty. Please enter or upload valid JSON.',
        line: 1,
        column: 1,
      },
    };
  }

  try {
    JSON.parse(trimmed);
    return { isValid: true };
  } catch (err: any) {
    const errorMsg = err?.message || 'Invalid JSON syntax';
    let line: number | undefined;
    let column: number | undefined;

    // Check for "at line X column Y"
    const lineColMatch = errorMsg.match(/line (\d+) column (\d+)/i);
    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10);
      column = parseInt(lineColMatch[2], 10);
    } else {
      // Check for "position X"
      const posMatch = errorMsg.match(/position (\d+)/i);
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        const upToPos = trimmed.slice(0, pos);
        const lines = upToPos.split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }
    }

    // Get snippet
    let snippet: string | undefined;
    if (line) {
      const lines = trimmed.split('\n');
      const errLine = lines[line - 1];
      if (errLine !== undefined) {
        snippet = `Line ${line}: ${errLine.slice(0, 80)}`;
      }
    }

    return {
      isValid: false,
      error: {
        message: `Invalid JSON\n\n${errorMsg}${line && column ? ` at line ${line}, column ${column}.` : '.'}\n\nPlease fix the JSON and try again.`,
        line,
        column,
        snippet,
        suggestion: 'Check for trailing commas, unquoted keys, or mismatched brackets/quotes.',
      },
    };
  }
}

export function formatJson(raw: string, space: number = 2): string {
  const parsed = JSON.parse(raw);
  return JSON.stringify(parsed, null, space);
}

export function minifyJson(raw: string): string {
  const parsed = JSON.parse(raw);
  return JSON.stringify(parsed);
}

/**
 * Recursively flattens an object into dot-notation keys (e.g. address.city).
 * Keeps arrays as arrays (or stringifies them) to prevent explosion.
 */
export function flattenObject(
  obj: any,
  prefix = '',
  res: Record<string, any> = {}
): Record<string, any> {
  if (obj === null || obj === undefined) {
    if (prefix) res[prefix] = null;
    return res;
  }

  if (typeof obj !== 'object') {
    if (prefix) res[prefix] = obj;
    return res;
  }

  if (Array.isArray(obj)) {
    // If it's an array of primitives, keep it readable; if array of objects, represent nicely
    res[prefix] = obj;
    return res;
  }

  const keys = Object.keys(obj);
  if (keys.length === 0 && prefix) {
    res[prefix] = {};
    return res;
  }

  for (const key of keys) {
    const val = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      flattenObject(val, newKey, res);
    } else {
      res[newKey] = val;
    }
  }

  return res;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;

function inferValueType(val: any): FieldType {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'number') return 'number';
  if (typeof val === 'boolean') return 'boolean';
  if (Array.isArray(val)) return 'array';
  if (typeof val === 'object') return 'object';
  if (typeof val === 'string') {
    if (ISO_DATE_REGEX.test(val.trim()) && !isNaN(Date.parse(val))) {
      return 'date';
    }
    return 'string';
  }
  return 'string';
}

export function sanitizeTableName(name: string): string {
  // Strip extension, replace non-alphanumeric with underscore, avoid starting with digit
  let sanitized = name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9_]/g, '_');
  if (/^[0-9]/.test(sanitized)) {
    sanitized = `t_${sanitized}`;
  }
  if (!sanitized) sanitized = 'data';
  return sanitized;
}

/**
 * Transforms raw parsed JSON into a standardized flat row dataset with rich schema metadata.
 */
export async function processJsonToDataset(
  rawJson: string,
  datasetName: string,
  onProgress?: (progress: number, message: string) => void
): Promise<Dataset> {
  onProgress?.(10, 'Validating JSON syntax...');
  await new Promise((r) => setTimeout(r, 0));

  const parsed = JSON.parse(rawJson);

  onProgress?.(25, 'Normalizing structure...');
  await new Promise((r) => setTimeout(r, 0));

  let rawList: any[] = [];

  if (Array.isArray(parsed)) {
    rawList = parsed;
  } else if (typeof parsed === 'object' && parsed !== null) {
    // Check if the object contains a main array property (e.g. { data: [...] } or { users: [...] })
    const arrayKeys = Object.keys(parsed).filter((k) => Array.isArray(parsed[k]));
    if (arrayKeys.length === 1 && parsed[arrayKeys[0]].length > 0) {
      rawList = parsed[arrayKeys[0]];
    } else {
      // Single record
      rawList = [parsed];
    }
  } else {
    // Primitive root
    rawList = [{ value: parsed }];
  }

  const totalRows = rawList.length;
  onProgress?.(45, `Processing ${totalRows.toLocaleString()} records...`);
  await new Promise((r) => setTimeout(r, 0));

  // Flatten rows and gather all distinct column keys
  const allColumnKeysSet = new Set<string>();
  const flatRows: Record<string, any>[] = new Array(totalRows);

  const chunkSize = 2000;
  for (let i = 0; i < totalRows; i++) {
    const item = rawList[i];
    const flat = typeof item === 'object' && item !== null ? flattenObject(item) : { value: item };
    flatRows[i] = flat;
    for (const k of Object.keys(flat)) {
      allColumnKeysSet.add(k);
    }

    if (i % chunkSize === 0 && i > 0) {
      const pct = 45 + Math.round((i / totalRows) * 35);
      onProgress?.(pct, `Processed ${i.toLocaleString()} of ${totalRows.toLocaleString()} rows...`);
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  const columnKeys = Array.from(allColumnKeysSet);

  // Normalize missing properties across all rows so every row contains all keys
  for (let i = 0; i < totalRows; i++) {
    const row = flatRows[i];
    for (const col of columnKeys) {
      if (row[col] === undefined) {
        row[col] = null;
      }
    }
  }

  onProgress?.(85, 'Inferring column schemas and metrics...');
  await new Promise((r) => setTimeout(r, 0));

  // Compute column schemas
  const columns: ColumnSchema[] = columnKeys.map((key) => {
    let nullCount = 0;
    const typeCountMap: Record<FieldType, number> = {
      number: 0,
      string: 0,
      boolean: 0,
      date: 0,
      object: 0,
      array: 0,
      null: 0,
    };
    const uniqueValuesSet = new Set<string>();
    const sampleValues: any[] = [];
    let minVal: any = undefined;
    let maxVal: any = undefined;

    for (let i = 0; i < totalRows; i++) {
      const val = flatRows[i][key];
      if (val === null || val === undefined) {
        nullCount++;
        typeCountMap.null++;
      } else {
        const inferred = inferValueType(val);
        typeCountMap[inferred]++;

        const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        if (uniqueValuesSet.size < 1000) {
          uniqueValuesSet.add(strVal);
        }

        if (sampleValues.length < 5 && !sampleValues.includes(val)) {
          sampleValues.push(val);
        }

        // Min/Max for numbers and strings/dates
        if (typeof val === 'number') {
          if (minVal === undefined || val < minVal) minVal = val;
          if (maxVal === undefined || val > maxVal) maxVal = val;
        } else if (typeof val === 'string') {
          if (minVal === undefined || val < minVal) minVal = val;
          if (maxVal === undefined || val > maxVal) maxVal = val;
        }
      }
    }

    // Determine dominant type (excluding null)
    let dominantType: FieldType = 'string';
    let maxTypeCount = 0;
    for (const [t, cnt] of Object.entries(typeCountMap) as [FieldType, number][]) {
      if (t !== 'null' && cnt > maxTypeCount) {
        maxTypeCount = cnt;
        dominantType = t;
      }
    }

    if (maxTypeCount === 0) {
      dominantType = 'null';
    }

    return {
      key,
      label: key,
      type: dominantType,
      nullable: nullCount > 0,
      nullCount,
      uniqueCount: uniqueValuesSet.size,
      sampleValues,
      min: minVal,
      max: maxVal,
      visible: true,
      width: Math.max(120, Math.min(320, key.length * 12 + 40)),
    };
  });

  onProgress?.(100, 'Dataset ready!');

  const datasetId = `ds_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const sanitized = sanitizeTableName(datasetName);

  return {
    id: datasetId,
    name: datasetName,
    tableName: sanitized,
    originalJson: rawJson,
    rows: flatRows,
    columns,
    rowCount: totalRows,
    columnCount: columns.length,
    createdAt: Date.now(),
    fileSize: new Blob([rawJson]).size,
  };
}
