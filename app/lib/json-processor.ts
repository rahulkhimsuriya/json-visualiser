import type { ColumnSchema, Dataset, FieldType } from '../types/dataset';

export interface ParseErrorDetails {
  message: string;
  line?: number;
  column?: number;
  snippet?: string;
  suggestion?: string;
}

export function validateJsonString(raw: string): { isValid: boolean; error?: ParseErrorDetails } {
  const result = parseJsonString(raw);
  return result.isValid ? { isValid: true } : { isValid: false, error: result.error };
}

function createParseError(raw: string, err: unknown): ParseErrorDetails {
  const trimmed = raw.trim();
  const errorMsg = (err as { message?: string })?.message || 'Invalid JSON syntax';
  let line: number | undefined;
  let column: number | undefined;

  const lineColMatch = errorMsg.match(/line (\d+) column (\d+)/i);
  if (lineColMatch) {
    line = parseInt(lineColMatch[1], 10);
    column = parseInt(lineColMatch[2], 10);
  } else {
    const posMatch = errorMsg.match(/position (\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const lines = trimmed.slice(0, pos).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }
  }

  const errLine = line === undefined ? undefined : trimmed.split('\n')[line - 1];
  return {
    message: `Invalid JSON\n\n${errorMsg}${line && column ? ` at line ${line}, column ${column}.` : '.'}\n\nPlease fix the JSON and try again.`,
    line,
    column,
    snippet: errLine === undefined ? undefined : `Line ${line}: ${errLine.slice(0, 80)}`,
    suggestion: 'Check for trailing commas, unquoted keys, or mismatched brackets/quotes.',
  };
}

/**
 * Parses JSON once and keeps the validation error format used by the import UI.
 * Callers that need to transform the data can pass the returned value directly
 * to `processParsedJsonToDataset` instead of parsing the same large payload again.
 */
export function parseJsonString(raw: string): { isValid: true; value: unknown } | { isValid: false; error: ParseErrorDetails } {
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
    return { isValid: true, value: JSON.parse(trimmed) };
  } catch (err) {
    return { isValid: false, error: createParseError(raw, err) };
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

const DATE_ONLY_REGEX = /^\d{4}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])$/;
const DATETIME_REGEX =
  /^\d{4}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])[T\s]([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?(Z|[+-]\d{2}(:?\d{2})?)?$/i;
const DECIMAL_STRING_REGEX = /^-?(0|[1-9]\d*)\.\d+$/;
const INTEGER_STRING_REGEX = /^-?(0|[1-9]\d*)$/;

// Epoch range constants (2000-01-01 to 2050-01-01)
const MIN_EPOCH_SEC = 946684800;
const MAX_EPOCH_SEC = 2524608000;
const MIN_EPOCH_MS = 946684800000;
const MAX_EPOCH_MS = 2524608000000;

function isTimestampName(key?: string): boolean {
  if (!key) return false;
  const k = key.toLowerCase();
  if (/(?:_id$|^id$|id$)/i.test(k)) return false;
  return /(?:timestamp|epoch|_at$|at$|^time$|date)/i.test(k);
}

function isTimestampNumber(val: number, key?: string): boolean {
  if (!Number.isFinite(val) || !Number.isInteger(val)) return false;
  if (key && /(?:_id$|^id$|id$)/i.test(key)) return false;

  const hasHint = isTimestampName(key);

  // 13-digit epoch milliseconds
  if (val >= MIN_EPOCH_MS && val <= MAX_EPOCH_MS) {
    return true;
  }

  // 10-digit epoch seconds with timestamp-like field name
  if (val >= MIN_EPOCH_SEC && val <= MAX_EPOCH_SEC && hasHint) {
    return true;
  }

  return false;
}

export function inferValueType(val: any, key?: string): FieldType {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'boolean') return 'boolean';
  if (Array.isArray(val)) return 'array';
  if (typeof val === 'object') return 'object';

  if (typeof val === 'number') {
    if (!Number.isFinite(val)) return 'null';
    if (isTimestampNumber(val, key)) return 'timestamp';
    if (Number.isInteger(val)) return 'number';
    return 'decimal';
  }

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return 'string';

    const lower = trimmed.toLowerCase();
    if (lower === 'true' || lower === 'false') {
      return 'boolean';
    }

    // Check date only (YYYY-MM-DD)
    if (DATE_ONLY_REGEX.test(trimmed)) {
      const parsedTime = Date.parse(trimmed);
      if (!isNaN(parsedTime)) {
        return 'date';
      }
    }

    // Check datetime (ISO 8601 or YYYY-MM-DD HH:mm:ss)
    if (DATETIME_REGEX.test(trimmed)) {
      const parsedTime = Date.parse(trimmed);
      if (!isNaN(parsedTime)) {
        return 'datetime';
      }
    }

    // Check string timestamp
    if (isTimestampName(key) && (trimmed.length === 10 || trimmed.length === 13) && /^\d+$/.test(trimmed)) {
      const num = Number(trimmed);
      if (isTimestampNumber(num, key)) {
        return 'timestamp';
      }
    }

    // Check decimal string (-12.34, 0.5)
    if (DECIMAL_STRING_REGEX.test(trimmed)) {
      return 'decimal';
    }

    // Check integer string (-42, 100, avoiding leading zeros like 00123)
    if (INTEGER_STRING_REGEX.test(trimmed)) {
      const num = Number(trimmed);
      if (isTimestampNumber(num, key)) {
        return 'timestamp';
      }
      return 'number';
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
  return processParsedJsonToDataset(parsed, rawJson, datasetName, onProgress, true);
}

/**
 * Builds a dataset from JSON that has already been parsed by the caller.
 * This avoids a second full JSON.parse during large-file imports.
 */
export async function processParsedJsonToDataset(
  parsed: unknown,
  rawJson: string,
  datasetName: string,
  onProgress?: (progress: number, message: string) => void,
  skipInitialProgress = false
): Promise<Dataset> {
  if (!skipInitialProgress) {
    onProgress?.(10, 'JSON syntax validated...');
    await new Promise((r) => setTimeout(r, 0));
  }

  onProgress?.(25, 'Normalizing structure...');
  await new Promise((r) => setTimeout(r, 0));

  let rawList: any[] = [];

  if (Array.isArray(parsed)) {
    rawList = parsed;
  } else if (typeof parsed === 'object' && parsed !== null) {
    const parsedObject = parsed as Record<string, unknown>;
    // Check if the object contains a main array property (e.g. { data: [...] } or { users: [...] })
    const arrayKeys = Object.keys(parsedObject).filter((k) => Array.isArray(parsedObject[k]));
    const onlyArray = arrayKeys.length === 1 ? parsedObject[arrayKeys[0]] : undefined;
    if (Array.isArray(onlyArray) && onlyArray.length > 0) {
      rawList = onlyArray;
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
      decimal: 0,
      date: 0,
      datetime: 0,
      timestamp: 0,
      string: 0,
      boolean: 0,
      object: 0,
      array: 0,
      null: 0,
    };
    const uniqueValuesSet = new Set<string>();
    const sampleValues: any[] = [];

    for (let i = 0; i < totalRows; i++) {
      const val = flatRows[i][key];
      if (val === null || val === undefined) {
        nullCount++;
        typeCountMap.null++;
      } else {
        const inferred = inferValueType(val, key);
        typeCountMap[inferred]++;

        const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        if (uniqueValuesSet.size < 1000) {
          uniqueValuesSet.add(strVal);
        }

        if (sampleValues.length < 5 && !sampleValues.includes(val)) {
          sampleValues.push(val);
        }
      }
    }

    // Determine dominant type with compatibility hierarchy
    const nonNullCount = totalRows - nullCount;
    let dominantType: FieldType = 'string';

    if (nonNullCount === 0) {
      dominantType = 'null';
    } else {
      const numericCount = typeCountMap.number + typeCountMap.decimal;
      const dateCount = typeCountMap.date + typeCountMap.datetime;

      if (
        numericCount === nonNullCount ||
        (numericCount / nonNullCount >= 0.8 && typeCountMap.string === 0 && typeCountMap.object === 0)
      ) {
        // Any decimal value elevates the column to decimal
        dominantType = typeCountMap.decimal > 0 ? 'decimal' : 'number';
      } else if (
        dateCount === nonNullCount ||
        (dateCount / nonNullCount >= 0.8 && typeCountMap.string === 0 && typeCountMap.object === 0)
      ) {
        // Any datetime value elevates the column to datetime
        dominantType = typeCountMap.datetime > 0 ? 'datetime' : 'date';
      } else if (typeCountMap.timestamp / nonNullCount >= 0.6) {
        dominantType = 'timestamp';
      } else {
        let maxTypeCount = 0;
        for (const [t, cnt] of Object.entries(typeCountMap) as [FieldType, number][]) {
          if (t !== 'null' && cnt > maxTypeCount) {
            maxTypeCount = cnt;
            dominantType = t;
          }
        }
      }
    }

    // Calculate min/max based on dominantType
    let minVal: any = undefined;
    let maxVal: any = undefined;

    for (let i = 0; i < totalRows; i++) {
      const val = flatRows[i][key];
      if (val === null || val === undefined) continue;

      if (dominantType === 'number' || dominantType === 'decimal' || dominantType === 'timestamp') {
        const num = typeof val === 'number' ? val : Number(val);
        if (!isNaN(num)) {
          if (minVal === undefined || num < minVal) minVal = num;
          if (maxVal === undefined || num > maxVal) maxVal = num;
        }
      } else if (dominantType === 'date' || dominantType === 'datetime') {
        const time = Date.parse(String(val));
        if (!isNaN(time)) {
          if (minVal === undefined || time < Date.parse(String(minVal))) minVal = String(val);
          if (maxVal === undefined || time > Date.parse(String(maxVal))) maxVal = String(val);
        }
      } else if (typeof val === 'string' || typeof val === 'number') {
        if (minVal === undefined || val < minVal) minVal = val;
        if (maxVal === undefined || val > maxVal) maxVal = val;
      }
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
