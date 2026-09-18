import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { ColumnSchema } from '../../types/dataset';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchColumn: string;
  onSearchColumnChange: (column: string) => void;
  columns: ColumnSchema[];
  matchCount: number;
  totalCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  searchColumn,
  onSearchColumnChange,
  columns,
  matchCount,
  totalCount,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on Ctrl/Cmd + F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isFiltered = searchQuery.trim().length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
      <div className="relative flex-1 flex items-center bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
        <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder={`Search all fields (or press ${typeof navigator !== 'undefined' && /Mac/.test(navigator.platform) ? '⌘' : 'Ctrl'}+F)...`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-2 pr-8 py-1.5 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
        />

        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2 rounded-full cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Target column selector (optional: all columns vs specific column) */}
      <select
        value={searchColumn}
        onChange={(e) => onSearchColumnChange(e.target.value)}
        className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
      >
        <option value="all">All Columns</option>
        {columns.map((c) => (
          <option key={c.key} value={c.key}>
            Column: {c.label}
          </option>
        ))}
      </select>

      {/* Matching indicator */}
      {isFiltered && (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap animate-in fade-in">
          {matchCount.toLocaleString()} matching rows
        </span>
      )}
    </div>
  );
};
