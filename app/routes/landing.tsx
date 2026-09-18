import React from 'react';
import { useNavigate, Link } from 'react-router';
import type { Route } from './+types/landing';
import {
  FileJson,
  UploadCloud,
  Table,
  Terminal,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Download,
  Layers,
  Sparkles,
  Lock,
  HardDrive
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PRESET_DATASETS, type SampleDatasetPreset } from '../lib/sample-data';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "JSON Visualiser — Privacy-First In-Browser Data Analysis" },
    { name: "description", content: "Transform raw JSON into interactive tables, inspect schemas, and execute SQL queries in your browser." },
  ];
}

export default function Landing() {
  const { datasets, loadPresetDataset } = useWorkspace();
  const navigate = useNavigate();

  const handleLoadSample = async (preset: SampleDatasetPreset) => {
    await loadPresetDataset(preset);
    navigate('/workspace/data');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Client-Side • Zero Data Ever Leaves Your Browser</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Transform & Query JSON in Your Browser
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          Paste or upload raw JSON. Explore data in a high-speed spreadsheet, inspect schemas, run real SQL queries locally with AlaSQL, and export to CSV or JSON with absolute privacy.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/import"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            Paste or Upload JSON
          </Link>

          {datasets.length > 0 ? (
            <Link
              to="/workspace/data"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Table className="w-4 h-4 text-indigo-500" />
              Open Active Workspace ({datasets.length} loaded)
            </Link>
          ) : (
            <button
              onClick={() => handleLoadSample(PRESET_DATASETS[0])}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Database className="w-4 h-4 text-indigo-500" />
              Try Sample Dataset
            </button>
          )}
        </div>
      </div>

      {/* Primary Workflow Visualizer */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
          The Primary Workflow
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4 text-center">
          {[
            { step: '1', title: 'JSON Input', desc: 'Paste or drop JSON', icon: FileJson },
            { step: '2', title: 'Process JSON', desc: 'Flatten & infer schema', icon: Zap },
            { step: '3', title: 'Dataset', desc: 'Normalized tables', icon: Layers },
            { step: '4', title: 'Explore / Table', desc: 'Search, sort, filter', icon: Table },
            { step: '5', title: 'SQL Query', desc: 'In-browser AlaSQL', icon: Terminal },
            { step: '6', title: 'Export', desc: 'Client-side CSV/JSON', icon: Download },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center justify-between"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1-Click Sample Presets */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Quick Start Datasets
          </h2>
          <p className="text-xs text-slate-500">
            Click any dataset to load and jump straight into the workspace table view.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_DATASETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleLoadSample(preset)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
                    {preset.filename}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {preset.data.length} records
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {preset.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Load into Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">IndexedDB Storage</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Datasets persist safely on your device in IndexedDB across browser refreshes without 5MB storage limits.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">In-Browser SQL</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Run real SQL queries with JOINs across multiple datasets, aggregations, and sub-millisecond execution times.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Zero Server Transmission</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your data is never transmitted to any remote server or third-party service. Works completely offline.
          </p>
        </div>
      </div>
    </div>
  );
}
