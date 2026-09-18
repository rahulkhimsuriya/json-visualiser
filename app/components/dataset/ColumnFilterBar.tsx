import React, { useState } from 'react';
import { Filter, Plus, X, Trash2 } from 'lucide-react';
import type { ColumnSchema, FilterCondition, FilterRule } from '../../types/dataset';

interface ColumnFilterBarProps {
  columns: ColumnSchema[];
  filterRules: FilterRule[];
  onAddFilter: (rule: FilterRule) => void;
  onRemoveFilter: (id: string) => void;
  onClearAll: () => void;
}

const CONDITION_LABELS: Record<FilterCondition, string> = {
  equals: 'equals',
  not_equals: 'does not equal',
  contains: 'contains',
  not_contains: 'does not contain',
  starts_with: 'starts with',
  ends_with: 'ends with',
  greater_than: 'greater than',
  less_than: 'less than',
  greater_equal: 'greater than or equal',
  less_equal: 'less than or equal',
  is_empty: 'is empty',
  is_not_empty: 'is not empty',
};

export const ColumnFilterBar: React.FC<ColumnFilterBarProps> = ({
  columns,
  filterRules,
  onAddFilter,
  onRemoveFilter,
  onClearAll,
}) => {
  const [selectedColumn, setSelectedColumn] = useState<string>(columns[0]?.key || '');
  const [condition, setCondition] = useState<FilterCondition>('contains');
  const [filterValue, setFilterValue] = useState<string>('');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColumn) return;
    if (!['is_empty', 'is_not_empty'].includes(condition) && !filterValue.trim()) return;

    onAddFilter({
      id: `filter_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      column: selectedColumn,
      condition,
      value: filterValue,
    });

    setFilterValue('');
    setIsBuilderOpen(false);
  };

  const isValueDisabled = condition === 'is_empty' || condition === 'is_not_empty';

  return (
    <div className="space-y-3">
      {/* Top action row */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setIsBuilderOpen(!isBuilderOpen)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
            isBuilderOpen || filterRules.length > 0
              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
          {filterRules.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
              {filterRules.length}
            </span>
          )}
        </button>

        {filterRules.length > 0 && (
          <button
            onClick={onClearAll}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>

      {/* Filter Builder dropdown */}
      {isBuilderOpen && (
        <form
          onSubmit={handleApply}
          className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3 animate-in fade-in duration-150"
        >
          {/* Column selector */}
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Column
            </label>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {columns.map((col) => (
                <option key={col.key} value={col.key}>
                  {col.label} ({col.type})
                </option>
              ))}
            </select>
          </div>

          {/* Condition selector */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as FilterCondition)}
              className="px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(CONDITION_LABELS).map(([cond, label]) => (
                <option key={cond} value={cond}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Value input */}
          <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Value
            </label>
            <input
              type="text"
              placeholder={isValueDisabled ? 'No value needed' : 'Filter value...'}
              disabled={isValueDisabled}
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
            />
          </div>

          {/* Submit button */}
          <div className="flex items-end gap-2 pt-5">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Apply Filter
            </button>
            <button
              type="button"
              onClick={() => setIsBuilderOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Close
            </button>
          </div>
        </form>
      )}

      {/* Active filters pill list */}
      {filterRules.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Filters (AND):
          </span>
          {filterRules.map((rule) => (
            <span
              key={rule.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800"
            >
              <strong className="font-semibold text-indigo-700 dark:text-indigo-300">
                {rule.column}
              </strong>
              <span className="text-slate-500 dark:text-slate-400">
                {CONDITION_LABELS[rule.condition]}
              </span>
              {!['is_empty', 'is_not_empty'].includes(rule.condition) && (
                <span className="font-mono bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.2 rounded text-[11px]">
                  "{rule.value}"
                </span>
              )}
              <button
                onClick={() => onRemoveFilter(rule.id)}
                className="p-0.5 text-indigo-500 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors ml-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
