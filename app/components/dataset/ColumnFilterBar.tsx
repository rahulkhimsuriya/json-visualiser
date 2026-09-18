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
        {/* Active Filter Count Badge */}
        <button
          onClick={() => setIsBuilderOpen(!isBuilderOpen)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
            filterRules.length > 0 || isBuilderOpen
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
          {filterRules.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
              {filterRules.length}
            </span>
          )}
        </button>

        {filterRules.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Filter Builder Dropdown / Panel */}
      {isBuilderOpen && (
        <form
          onSubmit={handleApply}
          className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Add Filter Condition
            </span>
            <button
              type="button"
              onClick={() => setIsBuilderOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Column selector */}
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {columns.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label} ({c.type})
                </option>
              ))}
            </select>

            {/* Condition operator */}
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as FilterCondition)}
              className="px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="contains">contains</option>
              <option value="not_contains">does not contain</option>
              <option value="equals">equals</option>
              <option value="not_equals">does not equal</option>
              <option value="starts_with">starts with</option>
              <option value="ends_with">ends with</option>
              <option value="greater_than">greater than (&gt;)</option>
              <option value="less_than">less than (&lt;)</option>
              <option value="greater_equal">greater or equal (&gt;=)</option>
              <option value="less_equal">less or equal (&lt;=)</option>
              <option value="is_empty">is empty / null</option>
              <option value="is_not_empty">is not empty</option>
            </select>

            {/* Value input */}
            <input
              type="text"
              placeholder={isValueDisabled ? 'No value needed' : 'Filter value...'}
              disabled={isValueDisabled}
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-40"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsBuilderOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Apply Filter
            </button>
          </div>
        </form>
      )}

      {/* Active Filter Chips */}
      {filterRules.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active:
          </span>
          {filterRules.map((rule) => {
            const col = columns.find((c) => c.key === rule.column);
            const colLabel = col ? col.label : rule.column;
            const condLabel = CONDITION_LABELS[rule.condition] || rule.condition;

            return (
              <span
                key={rule.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
              >
                <strong className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {colLabel}
                </strong>
                <span className="text-slate-500 dark:text-slate-400">
                  {condLabel}
                </span>
                {!['is_empty', 'is_not_empty'].includes(rule.condition) && (
                  <span className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.2 rounded text-[11px]">
                    "{rule.value}"
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveFilter(rule.id)}
                  className="p-0.5 text-emerald-500 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
