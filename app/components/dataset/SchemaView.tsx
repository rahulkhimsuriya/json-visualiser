import React, { useState } from 'react';
import {
  FileCode2,
  Hash,
  Type,
  ToggleLeft,
  Calendar,
  AlertTriangle,
  Layers,
  Search,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import type { ColumnSchema, Dataset, FieldType } from '../../types/dataset';

interface SchemaViewProps {
  dataset: Dataset;
}

export const SchemaView: React.FC<SchemaViewProps> = ({ dataset }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredColumns = dataset.columns.filter((col) => {
    if (typeFilter !== 'all' && col.type !== typeFilter) return false;
    if (search.trim()) {
      return col.key.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const handleCopyColumn = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const renderTypeBadge = (type: FieldType) => {
    switch (type) {
      case 'number':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Hash className="w-3 h-3" /> Number
          </span>
        );
      case 'date':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Calendar className="w-3 h-3" /> Date
          </span>
        );
      case 'boolean':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <ToggleLeft className="w-3 h-3" /> Boolean
          </span>
        );
      case 'object':
      case 'array':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
            <Layers className="w-3 h-3" /> {type === 'array' ? 'Array' : 'Object'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Type className="w-3 h-3" /> Text
          </span>
        );
    }
  };

  const nullableCount = dataset.columns.filter((c) => c.nullable).length;

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Rows</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {dataset.rowCount.toLocaleString()}
          </p>
          <span className="text-xs text-slate-500">records in dataset</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Columns</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {dataset.columnCount}
          </p>
          <span className="text-xs text-slate-500">detected schema fields</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nullable Columns</span>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {nullableCount}
          </p>
          <span className="text-xs text-slate-500">contain null or missing</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Raw Size</span>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {(dataset.fileSize / 1024).toFixed(1)} <span className="text-sm font-semibold">KB</span>
          </p>
          <span className="text-xs text-slate-500">original payload</span>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search column names..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {['all', 'number', 'string', 'boolean', 'date', 'object'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                typeFilter === t
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t === 'string' ? 'Text' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Schema Detail Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Column Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Nullable</th>
                <th className="px-4 py-3">Null Count</th>
                <th className="px-4 py-3">Unique Values</th>
                <th className="px-4 py-3">Min / Max</th>
                <th className="px-4 py-3">Sample Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              {filteredColumns.map((col) => {
                const nullPct = dataset.rowCount > 0 ? Math.round((col.nullCount / dataset.rowCount) * 100) : 0;
                const uniquePct = dataset.rowCount > 0 ? Math.round((col.uniqueCount / dataset.rowCount) * 100) : 0;

                return (
                  <tr key={col.key} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {col.key}
                        </span>
                        <button
                          onClick={() => handleCopyColumn(col.key)}
                          title="Copy column name"
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors cursor-pointer"
                        >
                          {copiedKey === col.key ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {renderTypeBadge(col.type)}
                    </td>

                    <td className="px-4 py-3.5">
                      {col.nullable ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> No
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                      {col.nullCount.toLocaleString()}{' '}
                      <span className="text-slate-400 text-xs">({nullPct}%)</span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                      {col.uniqueCount.toLocaleString()}{' '}
                      <span className="text-slate-400 text-xs">({uniquePct}%)</span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {col.min !== undefined || col.max !== undefined ? (
                        <div className="space-y-0.5">
                          <div>min: <span className="font-semibold text-slate-800 dark:text-slate-200">{String(col.min)}</span></div>
                          <div>max: <span className="font-semibold text-slate-800 dark:text-slate-200">{String(col.max)}</span></div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {col.sampleValues.slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 max-w-[120px] truncate"
                            title={String(s)}
                          >
                            {typeof s === 'object' ? JSON.stringify(s) : String(s)}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
