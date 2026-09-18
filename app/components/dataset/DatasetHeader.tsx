import React from 'react';
import {
  Table,
  Terminal,
  FileCode2,
  Download,
  Trash2,
  Plus,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import type { Dataset } from '../../types/dataset';

interface DatasetHeaderProps {
  dataset: Dataset;
  activeTab: 'data' | 'query' | 'schema';
  onTabChange: (tab: 'data' | 'query' | 'schema') => void;
  onOpenExport: () => void;
  onOpenAddJson: () => void;
  onDeleteDataset: () => void;
}

export const DatasetHeader: React.FC<DatasetHeaderProps> = ({
  dataset,
  activeTab,
  onTabChange,
  onOpenExport,
  onOpenAddJson,
  onDeleteDataset,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Dataset metadata and action bar */}
        <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {dataset.name}
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  table: {dataset.tableName}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                  {dataset.rowCount.toLocaleString()}
                </strong>{' '}
                rows ·{' '}
                <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                  {dataset.columnCount}
                </strong>{' '}
                columns · {(dataset.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            <button
              onClick={onOpenAddJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add JSON
            </button>

            <button
              onClick={onDeleteDataset}
              title="Delete this dataset from workspace"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-t border-slate-100 dark:border-slate-800/60">
          <button
            onClick={() => onTabChange('data')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'data'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Table className="w-4 h-4" />
            Data View
          </button>

          <button
            onClick={() => onTabChange('query')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'query'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Terminal className="w-4 h-4" />
            SQL Query
          </button>

          <button
            onClick={() => onTabChange('schema')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'schema'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            Schema
          </button>
        </div>
      </div>
    </div>
  );
};
