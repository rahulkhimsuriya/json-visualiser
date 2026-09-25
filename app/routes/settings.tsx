import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
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
  RotateCcw,
  Table,
  Terminal,
  Database,
  History,
  Bookmark,
  ShieldCheck,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { NullDisplayFormat, RowDensity, ThemeMode } from '../types/settings';
import { getStorageUsageEstimate } from '../lib/storage';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Settings — JSON Visualiser' },
    {
      name: 'description',
      content:
        'Configure appearance, table display preferences, SQL options, and local browser storage.',
    },
  ];
}

// Custom accessible toggle switch component
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="space-y-0.5">
        <label
          className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 block cursor-pointer select-none"
          onClick={() => !disabled && onChange(!checked)}
        >
          {label}
        </label>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
          checked ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const {
    datasets,
    queryHistory,
    savedQueries,
    settings,
    updateSettings,
    resetSettings,
    clearQueryHistory,
    clearSavedQueries,
    clearAllData,
  } = useWorkspace();

  const navigate = useNavigate();

  const [storageUsage, setStorageUsage] = useState<{
    localStorageKb: number;
    indexedDbKb: number;
    totalKb: number;
  }>({ localStorageKb: 0, indexedDbKb: 0, totalKb: 0 });

  const [confirmPurge, setConfirmPurge] = useState(false);
  const [notification, setNotification] = useState<{
    msg: string;
    type?: 'success' | 'info';
  } | null>(null);

  const refreshStorage = () => {
    getStorageUsageEstimate().then(setStorageUsage);
  };

  useEffect(() => {
    refreshStorage();
  }, [datasets.length, queryHistory.length, savedQueries.length]);

  const showNotification = (msg: string) => {
    setNotification({ msg, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDensityChange = (density: RowDensity) => {
    updateSettings({ ...settings, rowDensity: density });
  };

  const handleThemeChange = (theme: ThemeMode) => {
    updateSettings({ ...settings, theme });
  };

  const handleNullFormatChange = (fmt: NullDisplayFormat) => {
    updateSettings({ ...settings, nullDisplayFormat: fmt });
  };

  const handlePageSizeChange = (size: number) => {
    updateSettings({ ...settings, pageSize: size });
  };

  const handleLimitChange = (limit: number) => {
    updateSettings({ ...settings, defaultQueryLimit: limit });
  };

  const onResetDefaults = () => {
    resetSettings();
    showNotification('All preferences restored to default values.');
  };

  const onClearHistory = () => {
    clearQueryHistory();
    refreshStorage();
    showNotification('Query history cleared.');
  };

  const onClearSaved = () => {
    clearSavedQueries();
    refreshStorage();
    showNotification('Saved queries cleared.');
  };

  const onClearAll = async () => {
    await clearAllData();
    setConfirmPurge(false);
    navigate('/');
  };

  // Sample data for the live table preview
  const previewRows = [
    {
      id: 101,
      name: 'Alice Walker',
      role: 'Staff Engineer',
      dept: 'Core Platform',
      score: 98,
    },
    {
      id: 102,
      name: 'Marcus Chen',
      role: 'Product Designer',
      dept: 'Design Systems',
      score: null,
    },
    {
      id: 103,
      name: 'Sarah Connor',
      role: 'Security Lead',
      dept: 'SecOps',
      score: 94,
    },
  ];

  const densityPaddingMap: Record<RowDensity, string> = {
    compact: 'py-1.5 px-3 text-xs',
    standard: 'py-2.5 px-3.5 text-xs',
    relaxed: 'py-3.5 px-4 text-sm',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:via-teal-500/15 dark:to-cyan-500/10 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Application Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Customize visual themes, table preferences, SQL defaults, and local browser storage.
            </p>
          </div>
        </div>

        {/* Reset to Defaults button */}
        <button
          onClick={onResetDefaults}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
          title="Reset all settings to default"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Global Toast / Feedback Notification */}
      {notification && (
        <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-800/80 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{notification.msg}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ===================== SECTION 1: APPEARANCE ===================== */}
      <section className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100/80 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Appearance & Visual Theme
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose how JSONVisualiser looks or synchronize with your device’s system color mode.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: 'light' as ThemeMode,
                label: 'Light Mode',
                desc: 'Clean high-contrast theme for bright environments',
                icon: Sun,
                preview: (
                  <div className="w-full h-24 rounded-lg bg-slate-100 p-2 flex flex-col gap-1.5 border border-slate-200">
                    <div className="h-3 rounded bg-white border border-slate-200 flex items-center px-1.5 gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <div className="w-6 h-1 rounded bg-slate-200" />
                    </div>
                    <div className="flex-1 bg-white rounded border border-slate-200 p-1.5 flex flex-col gap-1">
                      <div className="h-1.5 w-16 rounded bg-slate-300" />
                      <div className="h-1.5 w-full rounded bg-slate-100" />
                      <div className="h-1.5 w-4/5 rounded bg-slate-100" />
                    </div>
                  </div>
                ),
              },
              {
                id: 'dark' as ThemeMode,
                label: 'Dark Mode',
                desc: 'Low-glare obsidian theme optimized for OLED & low light',
                icon: Moon,
                preview: (
                  <div className="w-full h-24 rounded-lg bg-[#080b12] p-2 flex flex-col gap-1.5 border border-slate-800">
                    <div className="h-3 rounded bg-[#0e1422] border border-slate-800 flex items-center px-1.5 gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <div className="w-6 h-1 rounded bg-slate-700" />
                    </div>
                    <div className="flex-1 bg-[#0e1422] rounded border border-slate-800 p-1.5 flex flex-col gap-1">
                      <div className="h-1.5 w-16 rounded bg-slate-600" />
                      <div className="h-1.5 w-full rounded bg-slate-800" />
                      <div className="h-1.5 w-4/5 rounded bg-slate-800" />
                    </div>
                  </div>
                ),
              },
              {
                id: 'system' as ThemeMode,
                label: 'System Preference',
                desc: 'Automatically matches your operating system’s theme',
                icon: Monitor,
                preview: (
                  <div className="w-full h-24 rounded-lg p-2 flex flex-col gap-1.5 border border-slate-300 dark:border-slate-700 bg-gradient-to-r from-slate-100 to-[#080b12]">
                    <div className="h-3 rounded bg-white/90 dark:bg-[#0e1422]/90 border border-slate-300 dark:border-slate-700 flex items-center justify-between px-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <div className="w-8 h-1 rounded bg-slate-400 dark:bg-slate-600" />
                    </div>
                    <div className="flex-1 rounded border border-slate-300 dark:border-slate-700 p-1.5 flex flex-col gap-1 bg-white/70 dark:bg-[#0e1422]/70">
                      <div className="h-1.5 w-16 rounded bg-slate-400 dark:bg-slate-600" />
                      <div className="h-1.5 w-full rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="h-1.5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                  </div>
                ),
              },
            ].map((themeOpt) => {
              const Icon = themeOpt.icon;
              const isSelected = settings.theme === themeOpt.id;

              return (
                <button
                  key={themeOpt.id}
                  onClick={() => handleThemeChange(themeOpt.id)}
                  className={`relative p-3.5 sm:p-4 rounded-xl text-left border flex flex-col gap-3 transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 text-slate-900 dark:text-white ring-2 ring-emerald-500/30 shadow-xs'
                      : 'border-slate-200/90 dark:border-slate-800/90 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {themeOpt.preview}

                  <div className="flex items-center justify-between w-full mt-1">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`w-4 h-4 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
                      />
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {themeOpt.label}
                      </span>
                    </div>

                    {/* Selected indicator */}
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-700 bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {themeOpt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== SECTION 2: TABLE PREFERENCES ===================== */}
      <section className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100/80 dark:border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Table className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Table & Spreadsheet Display
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure density, pagination, index numbering, and empty value representations.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Row Density */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                Row Density
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Current:{' '}
                <strong className="capitalize text-emerald-600 dark:text-emerald-400">
                  {settings.rowDensity}
                </strong>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Adjust vertical row spacing for compact data analysis or comfortable reading.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                {
                  id: 'compact' as RowDensity,
                  label: 'Compact',
                  badge: '32px',
                  note: 'Max records',
                },
                {
                  id: 'standard' as RowDensity,
                  label: 'Standard',
                  badge: '40px',
                  note: 'Balanced',
                },
                {
                  id: 'relaxed' as RowDensity,
                  label: 'Relaxed',
                  badge: '48px',
                  note: 'Spacious',
                },
              ].map((item) => {
                const isSelected = settings.rowDensity === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleDensityChange(item.id)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-xs sm:text-sm">{item.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          isSelected
                            ? 'bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100'
                            : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-normal block mt-1">
                      {item.note}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rows Per Page (Page Size) */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                  Default Page Size
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Number of records rendered per page in data view
                </p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                {[25, 50, 100, 250].map((size) => (
                  <button
                    key={size}
                    onClick={() => handlePageSizeChange(size)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      settings.pageSize === size
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row Numbers (#) Toggle Switch */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <ToggleSwitch
              checked={settings.showRowNumbers}
              onChange={(val) => updateSettings({ ...settings, showRowNumbers: val })}
              label="Row Numbers (#)"
              description="Display sequential numeric line index numbers in the left column"
            />
          </div>

          {/* Null Value Representation */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                  Null Value Format
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  How null, missing, or undefined properties render in table cells
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                {(['-', 'null', '(empty)'] as NullDisplayFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => handleNullFormatChange(fmt)}
                    className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                      settings.nullDisplayFormat === fmt
                        ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* LIVE PREVIEW CARD */}
          <div className="mt-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 backdrop-blur-xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                <span>Live Interactive Preview</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Updates immediately with your settings
              </span>
            </div>

            {/* Mini Sample Table */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {settings.showRowNumbers && (
                      <th className="w-12 px-3 py-2 text-center border-r border-slate-200 dark:border-slate-800 font-mono text-slate-400">
                        #
                      </th>
                    )}
                    <th className="px-3 py-2 border-r border-slate-200 dark:border-slate-800">
                      id
                    </th>
                    <th className="px-3.5 py-2 border-r border-slate-200 dark:border-slate-800">
                      name
                    </th>
                    <th className="px-3.5 py-2 border-r border-slate-200 dark:border-slate-800">
                      role
                    </th>
                    <th className="px-3.5 py-2 border-r border-slate-200 dark:border-slate-800">
                      department
                    </th>
                    <th className="px-3.5 py-2">score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {previewRows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      {settings.showRowNumbers && (
                        <td className="px-3 py-1.5 text-center font-mono text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50/40 dark:bg-slate-900/40 border-r border-slate-100 dark:border-slate-800/80">
                          {idx + 1}
                        </td>
                      )}
                      <td
                        className={`${densityPaddingMap[settings.rowDensity]} font-mono text-emerald-600 dark:text-emerald-400 border-r border-slate-100 dark:border-slate-800/60`}
                      >
                        {row.id}
                      </td>
                      <td
                        className={`${densityPaddingMap[settings.rowDensity]} font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800/60`}
                      >
                        {row.name}
                      </td>
                      <td
                        className={`${densityPaddingMap[settings.rowDensity]} text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800/60`}
                      >
                        {row.role}
                      </td>
                      <td
                        className={`${densityPaddingMap[settings.rowDensity]} text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800/60`}
                      >
                        {row.dept}
                      </td>
                      <td className={`${densityPaddingMap[settings.rowDensity]} font-mono`}>
                        {row.score !== null ? (
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {row.score}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic text-xs font-mono">
                            {settings.nullDisplayFormat === 'null'
                              ? 'null'
                              : settings.nullDisplayFormat === '(empty)'
                                ? '(empty)'
                                : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 3: SQL & QUERY PREFERENCES ===================== */}
      <section className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100/80 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                SQL Query & Editor Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure default SQL execution parameters and formatting behavior.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* Default Query LIMIT */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
            <div>
              <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                Default Query LIMIT
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Maximum row threshold automatically used in SQL queries to prevent memory pressure
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              {[50, 100, 250, 500, 1000].map((limit) => (
                <button
                  key={limit}
                  onClick={() => handleLimitChange(limit)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    settings.defaultQueryLimit === limit
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {limit}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Format SQL */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <ToggleSwitch
              checked={settings.autoFormatSql}
              onChange={(val) => updateSettings({ ...settings, autoFormatSql: val })}
              label="Auto-format SQL Queries"
              description="Automatically clean and format SQL query syntax when executed"
            />
          </div>
        </div>
      </section>

      {/* ===================== SECTION 4: LOCAL STORAGE & DATA MANAGEMENT ===================== */}
      <section className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100/80 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Local Storage & Data Privacy
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage client-side dataset cache, query history, and saved SQL snippets.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% Private (No Cloud Storage)</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Storage Metric Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Datasets */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Datasets</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">IndexedDB</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {datasets.length}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5 font-medium">
                  {datasets.length === 1 ? 'dataset' : 'datasets'} cached
                </span>
              </div>
              {datasets.length > 0 ? (
                <Link
                  to="/workspace/data"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <span>View in Workspace</span>
                </Link>
              ) : (
                <span className="text-xs text-slate-400">No active datasets</span>
              )}
            </div>

            {/* Query History */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <History className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Query History</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">localStorage</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {queryHistory.length}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5 font-medium">
                  recorded
                </span>
              </div>
              <button
                onClick={onClearHistory}
                disabled={queryHistory.length === 0}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear History</span>
              </button>
            </div>

            {/* Saved Queries */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Saved Queries</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">localStorage</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {savedQueries.length}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5 font-medium">
                  saved
                </span>
              </div>
              <button
                onClick={onClearSaved}
                disabled={savedQueries.length === 0}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Saved</span>
              </button>
            </div>
          </div>

          {/* Total Storage footprint bar */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                  Total In-Browser Storage Used
                </span>
                <span className="text-[11px] text-slate-400">
                  {storageUsage.indexedDbKb} KB in IndexedDB + {storageUsage.localStorageKb} KB in
                  localStorage
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {storageUsage.totalKb > 1024
                  ? `${(storageUsage.totalKb / 1024).toFixed(2)} MB`
                  : `${storageUsage.totalKb} KB`}
              </span>
            </div>
          </div>

          {/* DANGER ZONE */}
          <div className="pt-6 border-t border-slate-100/80 dark:border-slate-800/60">
            <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/25 backdrop-blur-xs p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                      Danger Zone: Purge All Local Data
                    </h3>
                    <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-0.5">
                      Permanently deletes all imported datasets, SQL query logs, saved queries, and
                      restores default settings.
                    </p>
                  </div>
                </div>

                {!confirmPurge && (
                  <button
                    onClick={() => setConfirmPurge(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-colors shadow-2xs cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Local Data</span>
                  </button>
                )}
              </div>

              {confirmPurge && (
                <div className="pt-3 border-t border-rose-200/80 dark:border-rose-900/60 space-y-3 animate-in fade-in duration-150">
                  <p className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                    Are you sure? This action is immediate and cannot be reversed.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmPurge(false)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onClearAll}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Purge Everything</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
