import React, { useState } from 'react';
import {
  FileCode2,
  Hash,
  Type,
  ToggleLeft,
  Calendar,
  CalendarClock,
  Timer,
  Calculator,
  AlertTriangle,
  Layers,
  Search,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  ChevronDown
} from 'lucide-react';
import type { ColumnSchema, Dataset, FieldType } from '../../types/dataset';
import { useWorkspace } from '../../context/WorkspaceContext';

interface SchemaViewProps {
  dataset: Dataset;
}

const TYPE_OPTIONS: { type: FieldType; label: string }[] = [
  { type: 'number', label: 'Number (Integer)' },
  { type: 'decimal', label: 'Decimal' },
  { type: 'datetime', label: 'DateTime' },
  { type: 'date', label: 'Date' },
  { type: 'timestamp', label: 'Timestamp (Unix)' },
  { type: 'boolean', label: 'Boolean' },
  { type: 'string', label: 'Text (String)' },
  { type: 'object', label: 'Object' },
  { type: 'array', label: 'Array' },
];

export const SchemaView: React.FC<SchemaViewProps> = ({ dataset }) => {
  const { updateColumnType } = useWorkspace();
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs">
            <Hash className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Number
          </span>
        );
      case 'decimal':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/80 shadow-2xs">
            <Calculator className="w-3 h-3 text-teal-600 dark:text-teal-400" /> Decimal
          </span>
        );
      case 'datetime':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/80 shadow-2xs">
            <CalendarClock className="w-3 h-3 text-orange-600 dark:text-orange-400" /> DateTime
          </span>
        );
      case 'date':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 shadow-2xs">
            <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Date
          </span>
        );
      case 'timestamp':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/80 shadow-2xs">
            <Timer className="w-3 h-3 text-violet-600 dark:text-violet-400" /> Timestamp
          </span>
        );
      case 'boolean':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80 shadow-2xs">
            <ToggleLeft className="w-3 h-3 text-purple-600 dark:text-purple-400" /> Boolean
          </span>
        );
      case 'object':
      case 'array':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/80 shadow-2xs">
            <Layers className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> {type === 'array' ? 'Array' : 'Object'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 shadow-2xs">
            <Type className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Text
          </span>
        );
    }
  };

  const nullableCount = dataset.columns.filter((c) => c.nullable).length;

  return (
    <div className="space-y-6">
      {/* Top Modern Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1320] border border-slate-200/90 dark:border-slate-800/90 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-800/60 transition-colors">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Records</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
            {dataset.rowCount.toLocaleString()}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">tabular rows</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1320] border border-slate-200/90 dark:border-slate-800/90 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-800/60 transition-colors">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Schema Columns</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
            {dataset.columnCount}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">detected fields</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1320] border border-slate-200/90 dark:border-slate-800/90 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-800/60 transition-colors">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nullable Fields</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1.5">
            {nullableCount}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">contain null/missing</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1320] border border-slate-200/90 dark:border-slate-800/90 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-800/60 transition-colors">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Raw Payload</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
            {(dataset.fileSize / 1024).toFixed(1)} <span className="text-sm font-semibold">KB</span>
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">browser memory</span>
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
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#0e1320] border border-slate-200/90 dark:border-slate-800/90 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/70 p-1 rounded-xl">
          {['all', 'number', 'decimal', 'datetime', 'date', 'timestamp', 'string', 'boolean', 'object'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                typeFilter === t
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t === 'string' ? 'Text' : t === 'datetime' ? 'DateTime' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Schema Detail Table */}
      <div className="bg-white dark:bg-[#0e1320] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200/90 dark:border-slate-800/90 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Column Name</th>
                <th className="px-5 py-3.5">Inferred Type</th>
                <th className="px-5 py-3.5">Nullable</th>
                <th className="px-5 py-3.5">Null Count</th>
                <th className="px-5 py-3.5">Cardinality</th>
                <th className="px-5 py-3.5">Min / Max</th>
                <th className="px-5 py-3.5">Sample Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs sm:text-sm">
              {filteredColumns.map((col) => {
                const nullPct = dataset.rowCount > 0 ? Math.round((col.nullCount / dataset.rowCount) * 100) : 0;
                const uniquePct = dataset.rowCount > 0 ? Math.round((col.uniqueCount / dataset.rowCount) * 100) : 0;

                return (
                  <tr key={col.key} className="hover:bg-emerald-50/25 dark:hover:bg-emerald-950/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {col.key}
                        </span>
                        <button
                          onClick={() => handleCopyColumn(col.key)}
                          title="Copy column name"
                          className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded transition-colors cursor-pointer"
                        >
                          {copiedKey === col.key ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="relative inline-flex items-center group">
                        <select
                          value={col.type}
                          onChange={(e) => updateColumnType(dataset.id, col.key, e.target.value as FieldType)}
                          className="appearance-none bg-transparent cursor-pointer pl-0 pr-6 py-0.5 border-none focus:outline-none focus:ring-0 text-transparent absolute inset-0 w-full h-full z-10"
                          title="Click to change or override column type"
                        >
                          {TYPE_OPTIONS.map((opt) => (
                            <option
                              key={opt.type}
                              value={opt.type}
                              className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 font-sans"
                            >
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1">
                          {renderTypeBadge(col.type)}
                          <ChevronDown className="w-3 h-3 text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
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

                    <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                      {col.nullCount.toLocaleString()}{' '}
                      <span className="text-slate-400 text-xs">({nullPct}%)</span>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                      {col.uniqueCount.toLocaleString()}{' '}
                      <span className="text-slate-400 text-xs">({uniquePct}%)</span>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {col.min !== undefined || col.max !== undefined ? (
                        col.type === 'timestamp' ? (
                          <div className="space-y-0.5">
                            <div title={`Epoch: ${col.min}`}>
                              min:{' '}
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {(() => {
                                  const epoch = Number(col.min);
                                  if (isNaN(epoch)) return String(col.min);
                                  const ms = epoch > 1e11 ? epoch : epoch * 1000;
                                  return new Date(ms).toISOString().replace('T', ' ').slice(0, 19);
                                })()}
                              </span>
                            </div>
                            <div title={`Epoch: ${col.max}`}>
                              max:{' '}
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {(() => {
                                  const epoch = Number(col.max);
                                  if (isNaN(epoch)) return String(col.max);
                                  const ms = epoch > 1e11 ? epoch : epoch * 1000;
                                  return new Date(ms).toISOString().replace('T', ' ').slice(0, 19);
                                })()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div>min: <span className="font-semibold text-slate-800 dark:text-slate-200">{String(col.min)}</span></div>
                            <div>max: <span className="font-semibold text-slate-800 dark:text-slate-200">{String(col.max)}</span></div>
                          </div>
                        )
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {col.sampleValues.slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 max-w-[120px] truncate border border-slate-200/60 dark:border-slate-700/60"
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
