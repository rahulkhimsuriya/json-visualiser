import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Trash2,
  Bookmark,
  History,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Terminal,
  Database,
  Layers,
  ChevronRight,
  Code
} from 'lucide-react';
import type { Dataset } from '../../types/dataset';
import type { QueryHistoryItem, QueryResult, SavedQuery } from '../../types/query';
import { executeSqlQuery, type SqlExecutionError } from '../../lib/sql-engine';
import { QueryResultsTable } from './QueryResultsTable';
import { QueryHistoryDrawer } from './QueryHistoryDrawer';
import { SavedQueriesDrawer } from './SavedQueriesDrawer';
import { DatasetSchemaSidebar } from './DatasetSchemaSidebar';
import { EmptyState } from '../common/EmptyState';

interface QueryViewProps {
  datasets: Dataset[];
  activeDatasetId: string | null;
  history: QueryHistoryItem[];
  savedQueries: SavedQuery[];
  onAddHistoryItem: (item: QueryHistoryItem) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  onSaveQuery: (name: string, sql: string) => void;
  onUpdateSavedQuery: (query: SavedQuery) => void;
  onDeleteSavedQuery: (id: string) => void;
  onDuplicateSavedQuery: (query: SavedQuery) => void;
  onOpenExportModal: () => void;
  initialSql?: string;
}

export const QueryView: React.FC<QueryViewProps> = ({
  datasets,
  activeDatasetId,
  history,
  savedQueries,
  onAddHistoryItem,
  onClearHistory,
  onDeleteHistoryItem,
  onSaveQuery,
  onUpdateSavedQuery,
  onDeleteSavedQuery,
  onDuplicateSavedQuery,
  onOpenExportModal,
  initialSql,
}) => {
  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  // SQL query state (default query or initialSql)
  const [sql, setSql] = useState<string>(initialSql || 'SELECT *\nFROM data\nLIMIT 100;');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<SqlExecutionError | null>(null);

  useEffect(() => {
    if (initialSql) {
      setSql(initialSql);
    }
  }, [initialSql]);
  const [isRunning, setIsRunning] = useState(false);

  // Drawers state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ctrl/Cmd + Enter to run, Ctrl/Cmd + S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        runQuery();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowSaveDialog(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sql, datasets, activeDatasetId]);

  const runQuery = async (customSql?: string) => {
    const targetSql = customSql || sql;
    if (!targetSql.trim()) return;

    setIsRunning(true);
    setQueryError(null);

    const { result, error } = await executeSqlQuery(targetSql, datasets, activeDataset?.id);

    setIsRunning(false);

    if (error) {
      setQueryError(error);
      setQueryResult(null);
      // Log failed query in history
      onAddHistoryItem({
        id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        sql: targetSql,
        timestamp: Date.now(),
        executionTimeMs: 0,
        rowCount: 0,
        success: false,
        error: error.message,
      });
    } else if (result) {
      setQueryResult(result);
      setQueryError(null);
      // Log successful query in history
      onAddHistoryItem({
        id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        sql: targetSql,
        timestamp: Date.now(),
        executionTimeMs: result.executionTimeMs,
        rowCount: result.rowCount,
        success: true,
      });
    }
  };

  const handleInsertText = (text: string) => {
    if (!textareaRef.current) {
      setSql((prev) => `${prev} ${text}`);
      return;
    }

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const before = sql.slice(0, start);
    const after = sql.slice(end);

    const newSql = `${before}${text}${after}`;
    setSql(newSql);

    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveName.trim() && sql.trim()) {
      onSaveQuery(saveName.trim(), sql);
      setShowSaveDialog(false);
      setSaveName('');
    }
  };

  // Quick query starter snippet templates
  const snippets = [
    { label: 'Select 100', sql: 'SELECT *\nFROM data\nLIMIT 100;' },
    {
      label: 'Where filter',
      sql: activeDataset?.columns[0]
        ? `SELECT *\nFROM data\nWHERE ${activeDataset.columns[0].key} IS NOT NULL\nLIMIT 50;`
        : "SELECT *\nFROM data\nWHERE country = 'India';",
    },
    {
      label: 'Group By Count',
      sql: 'SELECT country, COUNT(*)\nFROM data\nGROUP BY country;',
    },
    {
      label: 'Order Descending',
      sql: 'SELECT *\nFROM data\nORDER BY id DESC\nLIMIT 25;',
    },
  ];

  // If multiple datasets exist, add a JOIN template
  if (datasets.length > 1) {
    const d1 = datasets[0];
    const d2 = datasets[1];
    snippets.push({
      label: `Join (${d1.tableName} + ${d2.tableName})`,
      sql: `SELECT *\nFROM ${d1.tableName}\nJOIN ${d2.tableName}\nLIMIT 20;`,
    });
  }

  return (
    <div className="space-y-6">
      {/* Query workspace grid: Left Editor, Right Schema & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SQL Editor Area (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            {/* Header / snippet chips */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  SQL Editor
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  (Default table: <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">data</code>)
                </span>
              </div>

              {/* Drawers toggles */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsSavedOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Saved</span>
                  <span className="text-[10px] text-slate-400 font-mono">({savedQueries.length})</span>
                </button>

                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-indigo-500" />
                  <span>History</span>
                  <span className="text-[10px] text-slate-400 font-mono">({history.length})</span>
                </button>
              </div>
            </div>

            {/* Snippet chips */}
            <div className="px-4 py-2 bg-slate-50/40 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Templates:
              </span>
              {snippets.map((snip, idx) => (
                <button
                  key={idx}
                  onClick={() => setSql(snip.sql)}
                  className="px-2 py-0.5 text-[11px] font-mono bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 rounded-md transition-colors cursor-pointer"
                >
                  {snip.label}
                </button>
              ))}
            </div>

            {/* Code Textarea Editor */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                rows={8}
                placeholder="SELECT * FROM data LIMIT 100;"
                className="w-full p-4 font-mono text-xs sm:text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-y leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Footer Toolbar */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => runQuery()}
                  disabled={isRunning || !sql.trim()}
                  className="inline-flex items-center gap-2 px-4 py-1.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {isRunning ? 'Executing...' : 'Run Query'}
                </button>

                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  {typeof navigator !== 'undefined' && /Mac/.test(navigator.platform) ? '⌘+Enter' : 'Ctrl+Enter'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSaveDialog(true)}
                  disabled={!sql.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
                  Save Query
                </button>

                <button
                  onClick={() => setSql('')}
                  disabled={!sql.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Query Error Box (Phase 12) */}
          {queryError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-start gap-3 text-rose-900 dark:text-rose-200 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs sm:text-sm">
                <h4 className="font-bold text-rose-800 dark:text-rose-300">
                  Query failed
                </h4>
                <p className="mt-1 font-mono">{queryError.message}</p>
                {queryError.suggestion && (
                  <p className="mt-2 text-xs text-rose-700 dark:text-rose-400 font-medium">
                    💡 {queryError.suggestion}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Query Results Table (Phase 11) */}
          {queryResult && (
            <QueryResultsTable
              result={queryResult}
              onOpenExportModal={onOpenExportModal}
            />
          )}

          {!queryResult && !queryError && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
              <EmptyState
                icon={Terminal}
                title="No query results yet"
                description="Write a SQL query above and click Run Query (or press Ctrl+Enter) to explore your structured data."
                actionText="Run Sample Query"
                onAction={() => runQuery('SELECT * FROM data LIMIT 25;')}
              />
            </div>
          )}
        </div>

        {/* Available Tables & Columns Inspector Sidebar (4 cols on lg) */}
        <div className="lg:col-span-4 h-[600px] lg:h-auto">
          <DatasetSchemaSidebar
            datasets={datasets}
            onInsertText={handleInsertText}
          />
        </div>
      </div>

      {/* Save Query Modal Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleSaveSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md space-y-4"
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Save SQL Query
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Provide a memorable name for this query to access it anytime from Saved Queries.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Query Name
              </label>
              <input
                type="text"
                placeholder="e.g. Indian Customers, Top Orders by Amount"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!saveName.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-40 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Drawer */}
      <QueryHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectQuery={(qSql, autoRun) => {
          setSql(qSql);
          if (autoRun) runQuery(qSql);
        }}
        onDeleteQuery={onDeleteHistoryItem}
        onClearHistory={onClearHistory}
      />

      {/* Saved Queries Drawer */}
      <SavedQueriesDrawer
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedQueries={savedQueries}
        onSelectQuery={(qSql, autoRun) => {
          setSql(qSql);
          if (autoRun) runQuery(qSql);
        }}
        onDeleteQuery={onDeleteSavedQuery}
        onUpdateQuery={onUpdateSavedQuery}
        onDuplicateQuery={onDuplicateSavedQuery}
      />
    </div>
  );
};
