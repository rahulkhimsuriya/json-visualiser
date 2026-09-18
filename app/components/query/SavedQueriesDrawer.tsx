import React, { useState } from 'react';
import { Bookmark, X, Play, Copy, Trash2, Edit2, Plus, Check } from 'lucide-react';
import type { SavedQuery } from '../../types/query';
import { EmptyState } from '../common/EmptyState';

interface SavedQueriesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedQueries: SavedQuery[];
  onSelectQuery: (sql: string, autoRun?: boolean) => void;
  onDeleteQuery: (id: string) => void;
  onUpdateQuery: (query: SavedQuery) => void;
  onDuplicateQuery: (query: SavedQuery) => void;
}

export const SavedQueriesDrawer: React.FC<SavedQueriesDrawerProps> = ({
  isOpen,
  onClose,
  savedQueries,
  onSelectQuery,
  onDeleteQuery,
  onUpdateQuery,
  onDuplicateQuery,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const startEditing = (sq: SavedQuery) => {
    setEditingId(sq.id);
    setEditName(sq.name);
  };

  const saveEditing = (sq: SavedQuery) => {
    if (editName.trim()) {
      onUpdateQuery({
        ...sq,
        name: editName.trim(),
        updatedAt: Date.now(),
      });
    }
    setEditingId(null);
  };

  const handleCopy = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Saved SQL Queries
            </h3>
            <span className="text-xs font-mono text-slate-400">
              ({savedQueries.length})
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedQueries.map((sq) => {
            const isEditing = editingId === sq.id;
            return (
              <div
                key={sq.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all space-y-2"
              >
                {/* Title row */}
                <div className="flex items-center justify-between gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-2 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-emerald-500 rounded text-slate-900 dark:text-slate-100 focus:outline-none flex-1"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEditing(sq)}
                        className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {sq.name}
                      </h4>
                      <button
                        onClick={() => startEditing(sq)}
                        className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Rename query"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(sq.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* SQL display */}
                <pre className="p-2 rounded bg-white dark:bg-slate-900 font-mono text-[11px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap line-clamp-3 border border-slate-200/60 dark:border-slate-800">
                  {sq.sql}
                </pre>

                {/* Actions */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <button
                    onClick={() => {
                      onSelectQuery(sq.sql, true);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-emerald-600 dark:fill-emerald-400" />
                    Run Query
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(sq.id, sq.sql)}
                      title="Copy SQL"
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {copiedId === sq.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onDuplicateQuery(sq)}
                      title="Duplicate query"
                      className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteQuery(sq.id)}
                      title="Delete query"
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {savedQueries.length === 0 && (
            <div className="py-16">
              <EmptyState
                icon={Bookmark}
                title="No saved queries"
                description="Save your frequently used queries from the Query tab to bookmark them here."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
