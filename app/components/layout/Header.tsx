import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import {
  FileJson,
  ShieldCheck,
  Settings,
  Sun,
  Moon,
  Keyboard,
  Plus,
  Database,
  Table
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PrivacyModal } from './PrivacyModal';
import { ShortcutsModal } from './ShortcutsModal';

export const Header: React.FC = () => {
  const {
    datasets,
    activeDatasetId,
    setActiveDatasetId,
    settings,
    updateSettings
  } = useWorkspace();

  const navigate = useNavigate();
  const location = useLocation();
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const toggleTheme = () => {
    updateSettings({
      ...settings,
      theme: settings.theme === 'dark' ? 'light' : 'dark',
    });
  };

  const isWorkspace = location.pathname.startsWith('/workspace');

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">
                  JSON<span className="text-indigo-600 dark:text-indigo-400">Visualiser</span>
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden sm:flex items-center gap-1 text-xs font-semibold">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname === '/'
                    ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Home
              </Link>

              <Link
                to="/import"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname === '/import'
                    ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Import JSON
              </Link>

              {datasets.length > 0 && (
                <Link
                  to="/workspace/data"
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isWorkspace
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  Workspace
                </Link>
              )}
            </nav>

            {/* Privacy Badge */}
            <button
              onClick={() => setIsPrivacyOpen(true)}
              title="Click to view client-side privacy assurance"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Client-Side</span>
            </button>
          </div>

          {/* Dataset Selector Dropdown (When at least 1 dataset exists) */}
          {datasets.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <Database className="w-4 h-4 text-slate-400 ml-2 mr-1 hidden sm:block" />
                <select
                  value={activeDatasetId || ''}
                  onChange={(e) => {
                    setActiveDatasetId(e.target.value);
                    if (!isWorkspace) {
                      navigate('/workspace/data');
                    }
                  }}
                  className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 py-1 px-2 pr-6 focus:outline-none cursor-pointer"
                >
                  {datasets.map((d) => (
                    <option key={d.id} value={d.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {d.name} ({d.rowCount.toLocaleString()} rows)
                    </option>
                  ))}
                </select>
                <Link
                  to="/import"
                  title="Add another JSON dataset"
                  className="p-1 rounded-lg bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Right Tools: Shortcuts, Theme, Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Keyboard Shortcuts */}
            <button
              onClick={() => setIsShortcutsOpen(true)}
              title="Keyboard shortcuts (?)"
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Toggle Theme (Current: ${settings.theme})`}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Settings Link */}
            <Link
              to="/settings"
              title="Application Settings"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                location.pathname === '/settings'
                  ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Modals */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  );
};
