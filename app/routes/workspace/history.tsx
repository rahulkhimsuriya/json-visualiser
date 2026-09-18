import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from './+types/history';
import { History, Trash2, Copy, Play, Check, Clock } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { EmptyState } from '../../components/common/EmptyState';
import type { QueryHistoryItem } from '../../types/query';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Query History — JSON Visualiser" },
    { name: "description", content: "Review and re-run past SQL queries executed locally." },
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
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Query History
            </h1>
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
            Clear All History
          </button>
        )}
      </div>

      {/* History Items */}
      <div className="space-y-6">
        {grouped.map((group) => (
          <div key={group.label} className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {group.label}
            </h2>

            <div className="space-y-3">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-3"
                >
                  <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap border border-slate-200/60 dark:border-slate-700/60">
                    {item.sql}
                  </pre>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span>
                        <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                          {item.rowCount.toLocaleString()}
                        </strong>{' '}
                        rows
                      </span>
                      <span>•</span>
                      <span>{item.executionTimeMs}ms execution</span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(item.id, item.sql)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Copy SQL"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => handleRunInStudio(item.sql)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Run in Studio</span>
                      </button>

                      <button
                        onClick={() => deleteQueryHistory(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete from history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {queryHistory.length === 0 && (
          <div className="py-16">
            <EmptyState
              icon={Clock}
              title="No query history"
              description="Queries you run in the SQL Query studio will be automatically preserved here."
              actionText="Open Query Studio"
              onAction={() => navigate('/workspace/query')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
