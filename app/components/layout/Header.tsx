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
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-[#0e1422]/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-all">
                <FileJson className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  JSON<span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">Visualiser</span>
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  location.pathname === '/'
                    ? 'bg-slate-100 dark:bg-slate-800/90 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                }`}
              >
                Home
              </Link>

              <Link
                to="/import"
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  location.pathname === '/import'
                    ? 'bg-slate-100 dark:bg-slate-800/90 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                }`}
              >
                Import JSON
              </Link>

              {datasets.length > 0 && (
                <Link
                  to="/workspace/data"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isWorkspace
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Workspace</span>
                </Link>
              )}
            </nav>

            {/* Privacy Badge */}
            <button
              onClick={() => setIsPrivacyOpen(true)}
              title="Click to view client-side privacy guarantee"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 transition-all cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% Client-Side</span>
            </button>
          </div>

          {/* Dataset Selector Dropdown (When at least 1 dataset exists) */}
          {datasets.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative flex items-center bg-slate-100/80 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 ml-2 mr-1 hidden sm:block" />
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
                  className="p-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200/80 dark:border-slate-600 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Right Tools: Shortcuts, Theme, Settings */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Keyboard Shortcuts */}
            <button
              onClick={() => setIsShortcutsOpen(true)}
              title="Keyboard shortcuts (?)"
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Theme Toggle Button (Light/Dark) */}
            <button
              onClick={toggleTheme}
              title={`Toggle Theme (Current: ${settings.theme})`}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer group"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 group-hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Settings Link */}
            <Link
              to="/settings"
              title="Application Settings"
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                location.pathname === '/settings'
                  ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
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
