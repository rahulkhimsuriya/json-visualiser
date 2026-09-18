import React from 'react';
import { History, X, Trash2, Copy, Play, ArrowUpRight, Check, Clock } from 'lucide-react';
import type { QueryHistoryItem } from '../../types/query';
import { EmptyState } from '../common/EmptyState';

interface QueryHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: QueryHistoryItem[];
  onSelectQuery: (sql: string, autoRun?: boolean) => void;
  onDeleteQuery: (id: string) => void;
  onClearHistory: () => void;
}

export const QueryHistoryDrawer: React.FC<QueryHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectQuery,
  onDeleteQuery,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Group items by Today, Yesterday, Earlier
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const grouped: { label: string; items: QueryHistoryItem[] }[] = [
    {
      label: 'Today',
      items: history.filter((h) => h.timestamp >= today.getTime()),
    },
    {
      label: 'Yesterday',
      items: history.filter(
        (h) => h.timestamp >= yesterday.getTime() && h.timestamp < today.getTime()
      ),
    },
    {
      label: 'Earlier',
      items: history.filter((h) => h.timestamp < yesterday.getTime()),
    },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Query History
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                title="Clear all query history"
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {grouped.map((group) => (
            <div key={group.label} className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                {group.label}
              </h3>

              <div className="space-y-2">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
                  >
                    <pre className="font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap line-clamp-3 mb-2.5">
                      {item.sql}
                    </pre>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                      <div className="flex items-center gap-2">
                        <span>{item.rowCount.toLocaleString()} rows</span>
                        <span>•</span>
                        <span>{item.executionTimeMs}ms</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(item.id, item.sql)}
                          title="Copy SQL"
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            onSelectQuery(item.sql, false);
                            onClose();
                          }}
                          title="Load into Editor"
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            onSelectQuery(item.sql, true);
                            onClose();
                          }}
                          title="Run Query Again"
                          className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteQuery(item.id)}
                          title="Delete from History"
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {history.length === 0 && (
            <div className="py-16">
              <EmptyState
                icon={Clock}
                title="No query history"
                description="Queries you execute will appear here with execution time and row counts."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
