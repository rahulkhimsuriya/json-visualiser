import React, { useState } from 'react';
import { Columns3, Check, X } from 'lucide-react';
import type { ColumnSchema } from '../../types/dataset';

interface ColumnVisibilityMenuProps {
  columns: ColumnSchema[];
  hiddenColumnKeys: string[];
  onToggleColumn: (key: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

export const ColumnVisibilityMenu: React.FC<ColumnVisibilityMenuProps> = ({
  columns,
  hiddenColumnKeys,
  onToggleColumn,
  onShowAll,
  onHideAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const visibleCount = columns.length - hiddenColumnKeys.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
          isOpen
            ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
      >
        <Columns3 className="w-3.5 h-3.5" />
        <span>Columns</span>
        <span className="text-[11px] font-mono text-slate-400">
          ({visibleCount}/{columns.length})
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Toggle Columns
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onShowAll}
                  className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Show all
                </button>
                <button
                  onClick={onHideAll}
                  className="text-[11px] font-medium text-slate-400 hover:underline cursor-pointer"
                >
                  Hide all
                </button>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1">
              {columns.map((col) => {
                const isVisible = !hiddenColumnKeys.includes(col.key);
                return (
                  <button
                    key={col.key}
                    onClick={() => onToggleColumn(col.key)}
                    className="w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                  >
                    <span className="truncate pr-2">{col.label}</span>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        isVisible
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isVisible && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
