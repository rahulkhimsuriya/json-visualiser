import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Sun,
  Moon,
  Monitor,
  HardDrive,
  Trash2,
  AlertTriangle,
  Check,
  RotateCcw
} from 'lucide-react';
import type { AppSettings, NullDisplayFormat, RowDensity, ThemeMode } from '../../types/settings';
import { getStorageUsageEstimate } from '../../lib/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClearHistory: () => void;
  onClearSavedQueries: () => void;
  onClearAllLocalData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearHistory,
  onClearSavedQueries,
  onClearAllLocalData,
}) => {
  const [storageUsage, setStorageUsage] = useState<{
    localStorageKb: number;
    indexedDbKb: number;
    totalKb: number;
  }>({ localStorageKb: 0, indexedDbKb: 0, totalKb: 0 });

  const [confirmPurge, setConfirmPurge] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getStorageUsageEstimate().then(setStorageUsage);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDensityChange = (density: RowDensity) => {
    onUpdateSettings({ ...settings, rowDensity: density });
  };

  const handleThemeChange = (theme: ThemeMode) => {
    onUpdateSettings({ ...settings, theme });
  };

  const handleNullFormatChange = (fmt: NullDisplayFormat) => {
    onUpdateSettings({ ...settings, nullDisplayFormat: fmt });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Settings className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Application Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Appearance Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Appearance
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
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
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-semibold">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Preferences Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Table Preferences
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
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
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium capitalize border transition-colors cursor-pointer ${
                        settings.rowDensity === d
                          ? 'bg-white dark:bg-slate-900 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Row Numbers */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Row Numbers (#)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Display numeric line numbers on table rows
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showRowNumbers}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, showRowNumbers: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              {/* Null display representation */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Null Value Format
                  </span>
                  <span className="text-[11px] text-slate-400">
                    How null or missing properties appear in cells
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(['-', 'null', '(empty)'] as NullDisplayFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => handleNullFormatChange(fmt)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-colors cursor-pointer ${
                        settings.nullDisplayFormat === fmt
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Local Data Management & Storage Meter */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Local Storage Management
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                      Browser Storage Footprint
                    </span>
                    <span className="text-[11px] text-slate-400">
                      IndexedDB datasets + localStorage settings
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  {storageUsage.totalKb > 1024
                    ? `${(storageUsage.totalKb / 1024).toFixed(2)} MB`
                    : `${storageUsage.totalKb} KB`}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <button
                  onClick={onClearHistory}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Clear Query History
                </button>

                <button
                  onClick={onClearSavedQueries}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Clear Saved Queries
                </button>
              </div>

              {/* Destructive Clear All Local Data Button */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                {!confirmPurge ? (
                  <button
                    onClick={() => setConfirmPurge(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All Local Data...
                  </button>
                ) : (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-200">
                      <AlertTriangle className="w-4 h-4" />
                      Clear all local data?
                    </div>
                    <p className="text-rose-700 dark:text-rose-300">
                      This will permanently remove your locally stored datasets, queries, and preferences.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setConfirmPurge(false)}
                        className="px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onClearAllLocalData();
                          setConfirmPurge(false);
                          onClose();
                        }}
                        className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                      >
                        Clear Data
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
