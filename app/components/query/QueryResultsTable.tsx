import React, { useState, useMemo } from 'react';
import {
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { QueryResult } from '../../types/query';
import { exportData } from '../../lib/export-utils';

interface QueryResultsTableProps {
  result: QueryResult;
  onOpenExportModal: () => void;
}

export const QueryResultsTable: React.FC<QueryResultsTableProps> = ({
  result,
  onOpenExportModal,
}) => {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 100;

  const handleSort = (col: string) => {
    if (sortCol === col) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortCol(null);
        setSortDir('asc');
      }
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const processedRows = useMemo(() => {
    let rows = result.rows;

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        result.columns.some((c) => {
          const val = r[c];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
        })
      );
    }

    if (sortCol) {
      rows = [...rows].sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDir === 'asc' ? valA - valB : valB - valA;
        }
        const comp = String(valA).localeCompare(String(valB));
        return sortDir === 'asc' ? comp : -comp;
      });
    }

    return rows;
  }, [result, search, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(processedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = processedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleQuickExportCsv = () => {
    exportData(result.columns, result.rows, {
      filename: `query_results_${Date.now()}`,
      format: 'csv',
    });
  };

  const handleQuickExportJson = () => {
    exportData(result.columns, result.rows, {
      filename: `query_results_${Date.now()}`,
      format: 'json',
      jsonPretty: true,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Query Results</span>
              <span className="text-xs font-mono font-normal text-slate-500">
                ({result.rowCount.toLocaleString()} rows · {result.executionTimeMs}ms)
              </span>
            </h3>
          </div>
        </div>

        {/* Search and Quick Export */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search results..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36 sm:w-48"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleQuickExportCsv}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
              title="Export query results to CSV"
            >
              CSV
            </button>
            <button
              onClick={handleQuickExportJson}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
              title="Export query results to JSON"
            >
              JSON
            </button>
            <button
              onClick={onOpenExportModal}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="Advanced Export Options"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-h-[460px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 select-none">
            <tr>
              <th className="w-12 px-3 py-2.5 text-center text-slate-400 font-mono border-r border-slate-200 dark:border-slate-700">
                #
              </th>
              {result.columns.map((col) => {
                const isSorted = sortCol === col;
                return (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700/60 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono truncate">{col}</span>
                      <span className="text-slate-400">
                        {isSorted ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
            {paginatedRows.map((row, rIdx) => {
              const actualNum = (currentPage - 1) * pageSize + rIdx + 1;
              return (
                <tr
                  key={rIdx}
                  className="hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-colors"
                >
                  <td className="w-12 px-3 py-2 text-center text-slate-400 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                    {actualNum}
                  </td>
                  {result.columns.map((col) => {
                    const val = row[col];
                    return (
                      <td
                        key={col}
                        className="px-3 py-2 text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800/60 truncate max-w-xs"
                      >
                        {val === null || val === undefined ? (
                          <span className="text-slate-400 italic">-</span>
                        ) : typeof val === 'object' ? (
                          JSON.stringify(val)
                        ) : (
                          String(val)
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {processedRows.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400">
            No rows match the query results search filter.
          </div>
        )}
      </div>

      {/* Pagination if > pageSize */}
      {processedRows.length > pageSize && (
        <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page {currentPage} of {totalPages} ({processedRows.length} rows)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
