import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
  Table,
  Terminal,
  FileCode2,
  UploadCloud,
  Settings,
  ShieldCheck,
  Sun,
  Database,
  History,
  Bookmark
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PRESET_DATASETS } from '../../lib/sample-data';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacy: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenPrivacy,
}) => {
  const {
    datasets,
    loadPresetDataset,
    settings,
    updateSettings
  } = useWorkspace();

  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasDataset = datasets.length > 0;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'page-home',
      label: 'Go to Home / Landing',
      category: 'Navigation',
      icon: Table,
      action: () => navigate('/'),
    },
    {
      id: 'page-import',
      label: 'Import / Paste JSON Data',
      category: 'Navigation',
      icon: UploadCloud,
      action: () => navigate('/import'),
    },
    {
      id: 'tab-data',
      label: 'Switch to Data Table View',
      category: 'Workspace',
      icon: Table,
      action: () => navigate('/workspace/data'),
      disabled: !hasDataset,
    },
    {
      id: 'tab-query',
      label: 'Switch to SQL Query Studio',
      category: 'Workspace',
      icon: Terminal,
      action: () => navigate('/workspace/query'),
      disabled: !hasDataset,
    },
    {
      id: 'tab-schema',
      label: 'Switch to Schema Inspector',
      category: 'Workspace',
      icon: FileCode2,
      action: () => navigate('/workspace/schema'),
      disabled: !hasDataset,
    },
    {
      id: 'tab-history',
      label: 'View Query History',
      category: 'Workspace',
      icon: History,
      action: () => navigate('/workspace/history'),
      disabled: !hasDataset,
    },
    {
      id: 'tab-saved',
      label: 'View Saved Queries',
      category: 'Workspace',
      icon: Bookmark,
      action: () => navigate('/workspace/saved'),
      disabled: !hasDataset,
    },
    {
      id: 'load-sample-users',
      label: 'Load Sample: Users & Profiles (nested geo)',
      category: 'Data Presets',
      icon: Database,
      action: async () => {
        await loadPresetDataset(PRESET_DATASETS[0]);
        navigate('/workspace/data');
      },
    },
    {
      id: 'load-sample-orders',
      label: 'Load Sample: Orders (for SQL Joins)',
      category: 'Data Presets',
      icon: Database,
      action: async () => {
        await loadPresetDataset(PRESET_DATASETS[1]);
        navigate('/workspace/data');
      },
    },
    {
      id: 'load-sample-products',
      label: 'Load Sample: Products Catalog',
      category: 'Data Presets',
      icon: Database,
      action: async () => {
        await loadPresetDataset(PRESET_DATASETS[2]);
        navigate('/workspace/data');
      },
    },
    {
      id: 'page-settings',
      label: 'Open Settings',
      category: 'Preferences',
      icon: Settings,
      action: () => navigate('/settings'),
    },
    {
      id: 'privacy-guarantee',
      label: 'Privacy & Security Guarantee',
      category: 'Information',
      icon: ShieldCheck,
      action: onOpenPrivacy,
    },
    {
      id: 'toggle-theme',
      label: 'Toggle Light / Dark Theme',
      category: 'Preferences',
      icon: Sun,
      action: () =>
        updateSettings({
          ...settings,
          theme: settings.theme === 'dark' ? 'light' : 'dark',
        }),
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    if (cmd.disabled) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return cmd.label.toLowerCase().includes(q) || cmd.category.toLowerCase().includes(q);
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredCommands.map((cmd, idx) => {
            const Icon = cmd.icon;
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={cmd.id}
                onClick={() => {
                  cmd.action();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`p-1.5 rounded-lg ${
                      isSelected
                        ? 'bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-medium">{cmd.label}</span>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                  {cmd.category}
                </span>
              </button>
            );
          })}

          {filteredCommands.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
