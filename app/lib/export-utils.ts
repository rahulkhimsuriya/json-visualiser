export interface ExportOptions {
  filename: string;
  format: 'csv' | 'json';
  jsonPretty?: boolean;
  csvDelimiter?: string;
}

/**
 * Escapes a cell value for CSV format.
 */
function escapeCsvValue(val: any, delimiter: string): string {
  if (val === null || val === undefined) return '';

  let str: string;
  if (typeof val === 'object') {
    str = JSON.stringify(val);
  } else {
    str = String(val);
  }

  // If contains delimiter, quote, or newline, escape double quotes and wrap in quotes
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates CSV string from tabular array.
 */
export function generateCsv(
  columns: string[],
  rows: Record<string, any>[],
  delimiter = ','
): string {
  const header = columns.map((col) => escapeCsvValue(col, delimiter)).join(delimiter);
  const dataLines = rows.map((row) =>
    columns.map((col) => escapeCsvValue(row[col], delimiter)).join(delimiter)
  );

  return [header, ...dataLines].join('\r\n');
}

/**
 * Generates JSON string.
 */
export function generateJson(rows: Record<string, any>[], pretty = true): string {
  return pretty ? JSON.stringify(rows, null, 2) : JSON.stringify(rows);
}

/**
 * Initiates an in-browser download of the data without sending any data across the network.
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportData(
  columns: string[],
  rows: Record<string, any>[],
  options: ExportOptions
): void {
  const { filename, format, jsonPretty = true, csvDelimiter = ',' } = options;

  if (format === 'csv') {
    const csvContent = generateCsv(columns, rows, csvDelimiter);
    const finalName = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    downloadFile(csvContent, finalName, 'text/csv');
  } else {
    const jsonContent = generateJson(rows, jsonPretty);
    const finalName = filename.endsWith('.json') ? filename : `${filename}.json`;
    downloadFile(jsonContent, finalName, 'application/json');
  }
}
