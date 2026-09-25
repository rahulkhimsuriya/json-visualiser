import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from './+types/history';
import { History, Trash2, Copy, Play, Check, Clock } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { EmptyState } from '../../components/common/EmptyState';
import type { QueryHistoryItem } from '../../types/query';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Query History — JSON Visualiser' },
    { name: 'description', content: 'Review and re-run past SQL queries executed locally.' },
  ];
}

export default function WorkspaceHistoryPage() {
  const { queryHistory, clearQueryHistory, deleteQueryHistory } = useWorkspace();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleRunInStudio = (sql: string) => {
    navigate('/workspace/query', { state: { initialSql: sql } });
  };

  // Group items by Today, Yesterday, Earlier
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const grouped: { label: string; items: QueryHistoryItem[] }[] = [
    {
      label: 'Today',
      items: queryHistory.filter((h) => h.timestamp >= today.getTime()),
    },
    {
      label: 'Yesterday',
      items: queryHistory.filter(
        (h) => h.timestamp >= yesterday.getTime() && h.timestamp < today.getTime()
      ),
    },
    {
      label: 'Earlier',
      items: queryHistory.filter((h) => h.timestamp < yesterday.getTime()),
    },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Query History</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {queryHistory.length} total executions logged locally in your browser
            </p>
          </div>
        </div>

        {queryHistory.length > 0 && (
          <button
            onClick={clearQueryHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {queryHistory.length === 0 ? (
        <EmptyState
          icon={History}
          title="No query history yet"
          description="Every SQL query you execute in the Query tab is recorded here in browser storage so you can review and replay it anytime."
          actionText="Open Query Studio"
          onAction={() => navigate('/workspace/query')}
        />
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.label} className="space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {group.label}
              </h2>

              <div className="space-y-3">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">
                          {item.executionTimeMs.toFixed(1)}ms
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">
                          {item.rowCount.toLocaleString()} rows
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(item.id, item.sql)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer text-xs"
                          title="Copy SQL"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={() => handleRunInStudio(item.sql)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer text-xs shadow-xs"
                          title="Run this query in SQL Studio"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Run in Studio</span>
                        </button>

                        <button
                          onClick={() => deleteQueryHistory(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Delete from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap border border-slate-200/60 dark:border-slate-700/60 leading-relaxed">
                      {item.sql}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
