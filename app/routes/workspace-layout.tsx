import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router';
import {
  Table,
  Terminal,
  FileCode2,
  History,
  Bookmark,
  Download,
  Trash2,
  Plus,
  FileSpreadsheet,
  UploadCloud,
  Database
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { ExportModal } from '../components/export/ExportModal';
import { EmptyState } from '../components/common/EmptyState';
import { PRESET_DATASETS } from '../lib/sample-data';
import type { QueryResult } from '../types/query';

export default function WorkspaceLayout() {
  const {
    datasets,
    activeDataset,
    deleteDataset,
    activeDatasetId,
    loadPresetDataset,
    isInitialized
  } = useWorkspace();

  const navigate = useNavigate();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeQueryResult, setActiveQueryResult] = useState<QueryResult | null>(null);

  if (!isInitialized) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
      </div>
    );
  }

  if (!activeDataset || datasets.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <EmptyState
          icon={Database}
          title="No dataset loaded"
          description="Paste JSON or upload a JSON file to start exploring, inspecting schemas, and running SQL queries."
          actionText="Import JSON"
          onAction={() => navigate('/import')}
          secondaryActionText="Load Sample Users"
          onSecondaryAction={async () => {
            await loadPresetDataset(PRESET_DATASETS[0]);
            navigate('/workspace/data');
          }}
        />
      </div>
    );
  }

  const handleDelete = async () => {
    if (activeDatasetId) {
      await deleteDataset(activeDatasetId);
      if (datasets.length <= 1) {
        navigate('/');
      }
    }
  };

  const navItems = [
    { to: '/workspace/data', label: 'Data View', icon: Table },
    { to: '/workspace/query', label: 'SQL Query', icon: Terminal },
    { to: '/workspace/schema', label: 'Schema', icon: FileCode2 },
    { to: '/workspace/history', label: 'Query History', icon: History },
    { to: '/workspace/saved', label: 'Saved Queries', icon: Bookmark },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Workspace Header Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top metadata and actions */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {activeDataset.name}
                  </h1>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    table: {activeDataset.tableName}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                    {activeDataset.rowCount.toLocaleString()}
                  </strong>{' '}
                  rows ·{' '}
                  <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                    {activeDataset.columnCount}
                  </strong>{' '}
                  columns · {(activeDataset.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExportOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>

              <Link
                to="/import"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/60 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add JSON
              </Link>

              <button
                onClick={handleDelete}
                title="Delete this dataset"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-navigation tabs with React Router NavLink */}
          <div className="flex items-center space-x-1 border-t border-slate-100 dark:border-slate-800/60 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Routed Tab Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <Outlet context={{ onSetQueryResult: setActiveQueryResult, onOpenExport: () => setIsExportOpen(true) }} />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        dataset={activeDataset}
        queryResult={activeQueryResult}
      />
    </div>
  );
}
