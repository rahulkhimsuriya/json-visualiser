import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Columns3,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database,
  Calendar,
  CalendarClock,
  Timer,
  Calculator,
  Hash,
  Type,
  ToggleLeft
} from 'lucide-react';
import type { ColumnSchema, Dataset, FilterRule, SortRule } from '../../types/dataset';
import type { AppSettings } from '../../types/settings';
import { SearchBar } from './SearchBar';
import { ColumnFilterBar } from './ColumnFilterBar';
import { ColumnVisibilityMenu } from './ColumnVisibilityMenu';
import { EmptyState } from '../common/EmptyState';

interface DataTableViewProps {
  dataset: Dataset;
  settings: AppSettings;
}

export const DataTableView: React.FC<DataTableViewProps> = ({ dataset, settings }) => {
  // Sorting state
  const [sortRule, setSortRule] = useState<SortRule | null>(null);

  // Global search & targeted column search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('all');

  // Filter rules
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);

  // Hidden column keys
  const [hiddenColumnKeys, setHiddenColumnKeys] = useState<string[]>([]);

  // Column widths (resizable)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const c of dataset.columns) {
      init[c.key] = c.width || 160;
    }
    return init;
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(settings.pageSize || 100);

  // Filter & Search Logic
  const filteredRows = useMemo(() => {
    let rows = dataset.rows;

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((row) => {
        if (searchColumn !== 'all') {
          const val = row[searchColumn];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        }
        // Search all columns
        return dataset.columns.some((col) => {
          const val = row[col.key];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // 2. Filter Rules (AND logic)
    if (filterRules.length > 0) {
      rows = rows.filter((row) => {
        return filterRules.every((rule) => {
          const val = row[rule.column];
          const strVal = val === null || val === undefined ? '' : String(val).toLowerCase();
          const target = rule.value.toLowerCase();

          switch (rule.condition) {
            case 'equals':
              return strVal === target;
            case 'not_equals':
              return strVal !== target;
            case 'contains':
              return strVal.includes(target);
            case 'not_contains':
              return !strVal.includes(target);
            case 'starts_with':
              return strVal.startsWith(target);
            case 'ends_with':
              return strVal.endsWith(target);
            case 'greater_than': {
              const ruleCol = dataset.columns.find((c) => c.key === rule.column);
              if (ruleCol?.type === 'date' || ruleCol?.type === 'datetime') {
                return Date.parse(String(val)) > Date.parse(rule.value);
              }
              return Number(val) > Number(rule.value);
            }
            case 'less_than': {
              const ruleCol = dataset.columns.find((c) => c.key === rule.column);
              if (ruleCol?.type === 'date' || ruleCol?.type === 'datetime') {
                return Date.parse(String(val)) < Date.parse(rule.value);
              }
              return Number(val) < Number(rule.value);
            }
            case 'greater_equal': {
              const ruleCol = dataset.columns.find((c) => c.key === rule.column);
              if (ruleCol?.type === 'date' || ruleCol?.type === 'datetime') {
                return Date.parse(String(val)) >= Date.parse(rule.value);
              }
              return Number(val) >= Number(rule.value);
            }
            case 'less_equal': {
              const ruleCol = dataset.columns.find((c) => c.key === rule.column);
              if (ruleCol?.type === 'date' || ruleCol?.type === 'datetime') {
                return Date.parse(String(val)) <= Date.parse(rule.value);
              }
              return Number(val) <= Number(rule.value);
            }
            case 'is_empty':
              return val === null || val === undefined || String(val).trim() === '';
            case 'is_not_empty':
              return val !== null && val !== undefined && String(val).trim() !== '';
            default:
              return true;
          }
        });
      });
    }

    // 3. Sorting
    if (sortRule) {
      const { column, direction } = sortRule;
      const targetCol = dataset.columns.find((c) => c.key === column);
      const colType = targetCol?.type || 'string';

      rows = [...rows].sort((a, b) => {
        const valA = a[column];
        const valB = b[column];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (colType === 'number' || colType === 'decimal' || colType === 'timestamp') {
          const numA = Number(valA);
          const numB = Number(valB);
          if (!isNaN(numA) && !isNaN(numB)) {
            return direction === 'asc' ? numA - numB : numB - numA;
          }
        }

        if (colType === 'date' || colType === 'datetime') {
          const timeA = Date.parse(String(valA));
          const timeB = Date.parse(String(valB));
          if (!isNaN(timeA) && !isNaN(timeB)) {
            return direction === 'asc' ? timeA - timeB : timeB - timeA;
          }
        }

        if (typeof valA === 'number' && typeof valB === 'number') {
          return direction === 'asc' ? valA - valB : valB - valA;
        }

        const comp = String(valA).localeCompare(String(valB));
        return direction === 'asc' ? comp : -comp;
      });
    }

    return rows;
  }, [dataset, searchQuery, searchColumn, filterRules, sortRule]);

  // Pagination calculation
  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedRows = filteredRows.slice(startIdx, startIdx + pageSize);

  // Sorting handler
  const handleSort = (colKey: string) => {
    setSortRule((prev) => {
      if (!prev || prev.column !== colKey) {
        return { column: colKey, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { column: colKey, direction: 'desc' };
      }
      return null;
    });
  };

  // Column Resizing Logic
  const resizingRef = useRef<{ colKey: string; startX: number; startWidth: number } | null>(null);

  const onMouseDownResize = useCallback((colKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = {
      colKey,
      startX: e.clientX,
      startWidth: columnWidths[colKey] || 160,
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingRef.current) return;
      const deltaX = moveEvent.clientX - resizingRef.current.startX;
      const newWidth = Math.max(70, resizingRef.current.startWidth + deltaX);
      setColumnWidths((prev) => ({
        ...prev,
        [resizingRef.current!.colKey]: newWidth,
      }));
    };

    const onMouseUp = () => {
      resizingRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [columnWidths]);

  // Visible columns
  const visibleColumns = dataset.columns.filter((c) => !hiddenColumnKeys.includes(c.key));

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'number':
        return <Hash className="w-3.5 h-3.5 text-emerald-500" />;
      case 'decimal':
        return <Calculator className="w-3.5 h-3.5 text-teal-500" />;
      case 'datetime':
        return <CalendarClock className="w-3.5 h-3.5 text-orange-500" />;
      case 'date':
        return <Calendar className="w-3.5 h-3.5 text-amber-500" />;
      case 'timestamp':
        return <Timer className="w-3.5 h-3.5 text-violet-500" />;
      case 'boolean':
        return <ToggleLeft className="w-3.5 h-3.5 text-purple-500" />;
      case 'string':
        return <Type className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return <Database className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const renderCellContent = (val: any, type?: string) => {
    if (val === null || val === undefined || val === '') {
      return (
        <span className="text-slate-400 dark:text-slate-500 italic text-xs font-mono">
          {settings.nullDisplayFormat === 'null'
            ? 'null'
            : settings.nullDisplayFormat === '(empty)'
            ? '(empty)'
            : '—'}
        </span>
      );
    }
    if (typeof val === 'boolean') {
      return (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold ${
            val
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80'
          }`}
        >
          {String(val)}
        </span>
      );
    }
    if (type === 'timestamp') {
      const epoch = Number(val);
      if (!isNaN(epoch) && epoch > 0) {
        const ms = epoch > 1e11 ? epoch : epoch * 1000;
        const formatted = new Date(ms).toISOString().replace('T', ' ').slice(0, 19);
        return (
          <div className="flex items-center gap-1.5 truncate" title={`Timestamp: ${val} (${new Date(ms).toUTCString()})`}>
            <span className="font-mono text-xs text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 px-1.5 py-0.5 rounded border border-violet-200/60 dark:border-violet-800/60">
              {formatted}
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden xl:inline">({val})</span>
          </div>
        );
      }
    }
    if (type === 'decimal') {
      return (
        <span className="font-mono text-teal-700 dark:text-teal-300 font-medium truncate block">
          {String(val)}
        </span>
      );
    }
    if (type === 'datetime') {
      return (
        <span className="font-mono text-xs text-orange-700 dark:text-orange-300 truncate block" title={String(val)}>
          {String(val).replace('T', ' ')}
        </span>
      );
    }
    if (type === 'date') {
      return (
        <span className="font-mono text-xs text-amber-700 dark:text-amber-300 truncate block">
          {String(val)}
        </span>
      );
    }
    if (typeof val === 'object') {
      return (
        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 truncate max-w-xs block border border-slate-200/60 dark:border-slate-700/60" title={JSON.stringify(val)}>
          {JSON.stringify(val)}
        </span>
      );
    }
    return <span className="truncate block">{String(val)}</span>;
  };

  const densityPadding =
    settings.rowDensity === 'compact'
      ? 'py-1.5 px-3 text-xs'
      : settings.rowDensity === 'relaxed'
      ? 'py-3 px-4 text-sm'
      : 'py-2.5 px-3.5 text-xs sm:text-sm';

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Search, Filter, and Tools Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchColumn={searchColumn}
          onSearchColumnChange={setSearchColumn}
          columns={dataset.columns}
          matchCount={totalRows}
          totalCount={dataset.rowCount}
        />

        <div className="flex items-center gap-2">
          <ColumnVisibilityMenu
            columns={dataset.columns}
            hiddenColumnKeys={hiddenColumnKeys}
            onToggleColumn={(key) =>
              setHiddenColumnKeys((prev) =>
                prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
              )
            }
            onShowAll={() => setHiddenColumnKeys([])}
            onHideAll={() =>
              setHiddenColumnKeys(dataset.columns.slice(1).map((c) => c.key))
            }
          />
        </div>
      </div>

      {/* Filter Builder & Active Filter Chips */}
      <ColumnFilterBar
        columns={dataset.columns}
        filterRules={filterRules}
        onAddFilter={(rule) => setFilterRules((prev) => [...prev, rule])}
        onRemoveFilter={(id) => setFilterRules((prev) => prev.filter((r) => r.id !== id))}
        onClearAll={() => setFilterRules([])}
      />

      {/* Main Spreadsheet Table Container */}
      <div className="flex-1 bg-white dark:bg-[#0e1320] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs overflow-hidden flex flex-col min-h-[480px]">
        {/* Table summary bar */}
        <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <span>
              Showing <strong className="text-slate-900 dark:text-white font-bold">{paginatedRows.length}</strong> of{' '}
              <strong className="text-slate-900 dark:text-white font-bold">{totalRows.toLocaleString()}</strong> rows
            </span>
            {totalRows !== dataset.rowCount && (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                (filtered from {dataset.rowCount.toLocaleString()})
              </span>
            )}
            <span>•</span>
            <span>{visibleColumns.length} visible columns</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </select>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="flex-1 overflow-auto relative">
          <table className="w-full border-collapse text-left">
            {/* Sticky Frosted Header */}
            <thead className="sticky top-0 z-10 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-700/80">
              <tr>
                {/* Row Number Column */}
                {settings.showRowNumbers && (
                  <th className="w-14 px-3 py-3 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-r border-slate-200/80 dark:border-slate-700/80 select-none bg-slate-100/80 dark:bg-slate-800/80">
                    #
                  </th>
                )}

                {/* Data Column Headers */}
                {visibleColumns.map((col) => {
                  const isSorted = sortRule?.column === col.key;
                  const width = columnWidths[col.key] || 160;

                  return (
                    <th
                      key={col.key}
                      style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
                      className="relative px-3.5 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200/70 dark:border-slate-700/60 select-none group hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      <div
                        onClick={() => handleSort(col.key)}
                        className="flex items-center justify-between gap-1.5 cursor-pointer"
                        title={`Sort by ${col.label}`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {renderTypeIcon(col.type)}
                          <span className="truncate">{col.label}</span>
                        </div>

                        <span className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 shrink-0">
                          {isSorted ? (
                            sortRule?.direction === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                          )}
                        </span>
                      </div>

                      {/* Resizing Handle */}
                      <div
                        onMouseDown={(e) => onMouseDownResize(col.key, e)}
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-emerald-500 transition-colors z-20"
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {paginatedRows.map((row, rIdx) => {
                const actualRowNumber = startIdx + rIdx + 1;
                return (
                  <tr
                    key={rIdx}
                    className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors"
                  >
                    {settings.showRowNumbers && (
                      <td className="w-14 px-3 py-2 text-center text-xs font-mono text-slate-400 dark:text-slate-500 border-r border-slate-100 dark:border-slate-800/80 select-none bg-slate-50/40 dark:bg-slate-900/30">
                        {actualRowNumber}
                      </td>
                    )}

                    {visibleColumns.map((col) => {
                      const width = columnWidths[col.key] || 160;
                      return (
                        <td
                          key={col.key}
                          style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
                          className={`${densityPadding} text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800/60 truncate`}
                        >
                          {renderCellContent(row[col.key], col.type)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty state for zero rows */}
          {totalRows === 0 && (
            <div className="py-20">
              <EmptyState
                icon={Search}
                title="No matching records found"
                description="Try adjusting or clearing your search keywords and filter criteria."
                actionText="Clear Filters"
                onAction={() => {
                  setSearchQuery('');
                  setFilterRules([]);
                }}
              />
            </div>
          )}
        </div>

        {/* Pagination Controls Footer */}
        {totalRows > 0 && (
          <div className="p-3 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Page <strong className="text-slate-900 dark:text-white font-bold">{currentPage}</strong> of{' '}
              <strong className="text-slate-900 dark:text-white font-bold">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-3 py-1 font-mono font-bold text-slate-800 dark:text-slate-200">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Last Page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
