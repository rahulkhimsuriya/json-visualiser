import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from './+types/saved';
import { Bookmark, Play, Copy, Trash2, Edit2, Plus, Check, FileCode2 } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { EmptyState } from '../../components/common/EmptyState';
import type { SavedQuery } from '../../types/query';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Saved Queries — JSON Visualiser' },
    { name: 'description', content: 'Manage and run your saved SQL query bookmarks.' },
  ];
}

export default function WorkspaceSavedPage() {
  const { savedQueries, updateSavedQuery, deleteSavedQuery, duplicateSavedQuery } = useWorkspace();

  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const startEditing = (sq: SavedQuery) => {
    setEditingId(sq.id);
    setEditName(sq.name);
  };

  const saveEditing = (sq: SavedQuery) => {
    if (editName.trim()) {
      updateSavedQuery({
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

  const handleRunInStudio = (sql: string) => {
    navigate('/workspace/query', { state: { initialSql: sql } });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Saved Queries</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {savedQueries.length} query {savedQueries.length === 1 ? 'bookmark' : 'bookmarks'}{' '}
              saved in browser storage
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/workspace/query')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Query</span>
        </button>
      </div>

      {/* Saved Queries List */}
      {savedQueries.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={Bookmark}
            title="No saved queries"
            description="Save queries from the SQL Query Studio to bookmark them for one-click access."
            actionText="Open Query Studio"
            onAction={() => navigate('/workspace/query')}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {savedQueries.map((sq) => {
            const isEditing = editingId === sq.id;
            return (
              <div
                key={sq.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-3 py-1 text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-emerald-500 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none flex-1"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEditing(sq)}
                        className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {sq.name}
                      </h2>
                      <button
                        onClick={() => startEditing(sq)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
                        title="Rename query"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <span className="text-xs text-slate-400 font-mono">
                    Updated: {new Date(sq.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* SQL Display */}
                <pre className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap border border-slate-200/60 dark:border-slate-700/60">
                  {sq.sql}
                </pre>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                  <button
                    onClick={() => handleRunInStudio(sq.sql)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Run Query in Studio</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(sq.id, sq.sql)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Copy SQL"
                    >
                      {copiedId === sq.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedId === sq.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => duplicateSavedQuery(sq)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Duplicate query"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Duplicate</span>
                    </button>

                    <button
                      onClick={() => deleteSavedQuery(sq.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Delete query"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
