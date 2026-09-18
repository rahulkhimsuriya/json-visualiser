import React, { useState } from 'react';
import { Database, Table, ChevronRight, ChevronDown, Plus, Hash, Type, Calendar, ToggleLeft, Layers } from 'lucide-react';
import type { Dataset } from '../../types/dataset';

interface DatasetSchemaSidebarProps {
  datasets: Dataset[];
  onInsertText: (text: string) => void;
}

export const DatasetSchemaSidebar: React.FC<DatasetSchemaSidebarProps> = ({
  datasets,
  onInsertText,
}) => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    data: true,
  });

  const toggleTable = (name: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'number':
        return <Hash className="w-3 h-3 text-emerald-500" />;
      case 'date':
        return <Calendar className="w-3 h-3 text-amber-500" />;
      case 'boolean':
        return <ToggleLeft className="w-3 h-3 text-purple-500" />;
      default:
        return <Type className="w-3 h-3 text-emerald-500" />;
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 pb-3 mb-2 border-b border-slate-200 dark:border-slate-800">
        <Database className="w-4 h-4 text-emerald-500" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Available Tables & Columns
        </h3>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
        Click any table or column to insert into your SQL query.
      </p>

      <div className="flex-1 overflow-y-auto space-y-3">
        {/* Active dataset alias 'data' */}
        <div className="rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
          <div
            onClick={() => toggleTable('data')}
            className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/60 select-none transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedTables['data'] ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                data
              </span>
              <span className="text-[10px] text-slate-400">(current dataset)</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInsertText('data');
              }}
              className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              title="Insert 'data' table"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {expandedTables['data'] && datasets[0] && (
            <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1 bg-slate-50/50 dark:bg-slate-900/40">
              {datasets[0].columns.map((col) => (
                <button
                  key={col.key}
                  onClick={() => onInsertText(col.key.includes('.') ? `[${col.key}]` : col.key)}
                  className="w-full text-left px-2 py-1 rounded flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {renderTypeIcon(col.type)}
                    <span className="font-mono text-[11px] truncate">{col.key}</span>
                  </div>
                  <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-500" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* All loaded datasets by their specific table names */}
        {datasets.map((ds) => (
          <div
            key={ds.id}
            className="rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 overflow-hidden"
          >
            <div
              onClick={() => toggleTable(ds.tableName)}
              className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/60 select-none transition-colors"
            >
              <div className="flex items-center gap-2">
                {expandedTables[ds.tableName] ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  {ds.tableName}
                </span>
                <span className="text-[10px] text-slate-400">({ds.rowCount} rows)</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInsertText(ds.tableName);
                }}
                className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                title={`Insert '${ds.tableName}'`}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {expandedTables[ds.tableName] && (
              <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1 bg-slate-50/50 dark:bg-slate-900/40">
                {ds.columns.map((col) => {
                  const qualifiedCol = `${ds.tableName}.${col.key.includes('.') ? `[${col.key}]` : col.key}`;
                  return (
                    <button
                      key={col.key}
                      onClick={() => onInsertText(qualifiedCol)}
                      className="w-full text-left px-2 py-1 rounded flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group cursor-pointer"
                      title={`Insert ${qualifiedCol}`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {renderTypeIcon(col.type)}
                        <span className="font-mono text-[11px] truncate">{col.key}</span>
                      </div>
                      <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-500" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
