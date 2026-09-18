import React, { useState } from 'react';
import { Download, X, FileSpreadsheet, FileCode, Check } from 'lucide-react';
import type { Dataset } from '../../types/dataset';
import type { QueryResult } from '../../types/query';
import { exportData } from '../../lib/export-utils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: Dataset | null;
  queryResult: QueryResult | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  dataset,
  queryResult,
}) => {
  const [source, setSource] = useState<'dataset' | 'query'>(
    queryResult ? 'query' : 'dataset'
  );
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [filename, setFilename] = useState<string>(() => {
    if (queryResult && source === 'query') return `query_result_${Date.now()}`;
    return dataset ? dataset.name.replace(/\.[^/.]+$/, '') : `export_${Date.now()}`;
  });
  const [jsonPretty, setJsonPretty] = useState(true);
  const [csvDelimiter, setCsvDelimiter] = useState(',');

  if (!isOpen) return null;

  const activeTargetRows = source === 'dataset' ? dataset?.rows || [] : queryResult?.rows || [];
  const activeTargetCols =
    source === 'dataset'
      ? dataset?.columns.map((c) => c.key) || []
      : queryResult?.columns || [];

  const handleExport = () => {
    if (activeTargetCols.length === 0 || activeTargetRows.length === 0) return;

    exportData(activeTargetCols, activeTargetRows, {
      filename: filename.trim() || 'export',
      format,
      jsonPretty,
      csvDelimiter,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Download className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Export Data
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generated locally in your browser. Zero data sent to any server.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Data Source Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Select Data to Export
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSource('dataset')}
                disabled={!dataset}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  source === 'dataset'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                } disabled:opacity-40`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold">Current Dataset</span>
                  {source === 'dataset' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {dataset?.rowCount.toLocaleString() || 0} rows · {dataset?.name}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSource('query')}
                disabled={!queryResult}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  source === 'query'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                } disabled:opacity-40`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold">Query Result</span>
                  {source === 'query' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {queryResult ? `${queryResult.rowCount.toLocaleString()} rows` : 'No active query result'}
                </span>
              </button>
            </div>
          </div>

          {/* Export Format (CSV vs JSON) */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              File Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                  format === 'csv'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <div className="text-xs font-bold">CSV (.csv)</div>
                  <div className="text-[10px] text-slate-400">Spreadsheet table</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                  format === 'json'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileCode className="w-5 h-5 text-teal-600" />
                <div className="text-left">
                  <div className="text-xs font-bold">JSON (.json)</div>
                  <div className="text-[10px] text-slate-400">Structured data</div>
                </div>
              </button>
            </div>
          </div>

          {/* Filename input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              File Name
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-l-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="px-3 py-2 text-sm font-mono text-slate-400 bg-slate-100 dark:bg-slate-700 border-y border-r border-slate-200 dark:border-slate-700 rounded-r-xl">
                .{format}
              </span>
            </div>
          </div>

          {/* Format Options */}
          {format === 'csv' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                CSV Delimiter
              </label>
              <select
                value={csvDelimiter}
                onChange={(e) => setCsvDelimiter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="&#9;">Tab (\t)</option>
              </select>
            </div>
          )}

          {format === 'json' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="jsonPretty"
                checked={jsonPretty}
                onChange={(e) => setJsonPretty(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="jsonPretty" className="text-xs text-slate-700 dark:text-slate-300">
                Format JSON (pretty print with indentation)
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            {activeTargetRows.length.toLocaleString()} rows ready
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={activeTargetRows.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
