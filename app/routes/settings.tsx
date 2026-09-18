import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from './+types/settings';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  HardDrive,
  Trash2,
  AlertTriangle,
  Check,
  RotateCcw
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { NullDisplayFormat, RowDensity, ThemeMode } from '../types/settings';
import { getStorageUsageEstimate } from '../lib/storage';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Settings — JSON Visualiser" },
    { name: "description", content: "Configure appearance, table preferences, and local storage." },
  ];
}

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    clearQueryHistory,
    clearAllData
  } = useWorkspace();

  const navigate = useNavigate();

  const [storageUsage, setStorageUsage] = useState<{
    localStorageKb: number;
    indexedDbKb: number;
    totalKb: number;
  }>({ localStorageKb: 0, indexedDbKb: 0, totalKb: 0 });

  const [confirmPurge, setConfirmPurge] = useState(false);
  const [clearedMsg, setClearedMsg] = useState<string | null>(null);

  useEffect(() => {
    getStorageUsageEstimate().then(setStorageUsage);
  }, []);

  const handleDensityChange = (density: RowDensity) => {
    updateSettings({ ...settings, rowDensity: density });
  };

  const handleThemeChange = (theme: ThemeMode) => {
    updateSettings({ ...settings, theme });
  };

  const handleNullFormatChange = (fmt: NullDisplayFormat) => {
    updateSettings({ ...settings, nullDisplayFormat: fmt });
  };

  const onClearHistory = () => {
    clearQueryHistory();
    setClearedMsg('Query history cleared.');
    setTimeout(() => setClearedMsg(null), 2000);
    getStorageUsageEstimate().then(setStorageUsage);
  };

  const onClearAll = async () => {
    await clearAllData();
    setConfirmPurge(false);
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Application Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize visual theme, display preferences, and local storage on this device
          </p>
        </div>
      </div>

      {clearedMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          {clearedMsg}
        </div>
      )}

      {/* Settings Grid */}
      <div className="space-y-6">
        {/* Appearance Section */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Appearance
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = settings.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id as ThemeMode)}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-semibold">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Preferences Section */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Table Preferences
          </h2>

          <div className="space-y-4">
            {/* Row Density */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Row Density
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['compact', 'standard', 'relaxed'] as RowDensity[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => handleDensityChange(d)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium capitalize border transition-colors cursor-pointer ${
                      settings.rowDensity === d
                        ? 'bg-white dark:bg-slate-800 border-emerald-600 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Show Row Numbers */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Row Numbers (#)
                </span>
                <span className="text-[11px] text-slate-400">
                  Display sequential line numbers on table rows
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showRowNumbers}
                onChange={(e) =>
                  updateSettings({ ...settings, showRowNumbers: e.target.checked })
                }
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Null display representation */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Null Value Format
                </span>
                <span className="text-[11px] text-slate-400">
                  How null or missing properties appear in table cells
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {(['-', 'null', '(empty)'] as NullDisplayFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => handleNullFormatChange(fmt)}
                    className={`px-3 py-1 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
                      settings.nullDisplayFormat === fmt
                        ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Local Storage Section */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Local Storage & Privacy
          </h2>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-5 h-5 text-emerald-500" />
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Browser Storage Footprint
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Stored 100% on your device
                  </span>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                {storageUsage.totalKb > 1024
                  ? `${(storageUsage.totalKb / 1024).toFixed(2)} MB`
                  : `${storageUsage.totalKb} KB`}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onClearHistory}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Clear Query History
            </button>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">
              Danger Zone
            </h3>

            {!confirmPurge ? (
              <button
                onClick={() => setConfirmPurge(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Local Data...
              </button>
            ) : (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-200 text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Clear all local data?
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                  This will permanently remove your locally stored datasets, query history, saved queries, and preferences from your browser.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setConfirmPurge(false)}
                    className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onClearAll}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
                  >
                    Clear All Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
