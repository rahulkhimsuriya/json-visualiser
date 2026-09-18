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
  HardDrive,
  HelpCircle,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PRESET_DATASETS, type SampleDatasetPreset } from '../lib/sample-data';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "JSON Visualiser — Query JSON with SQL & Interactive Tables Locally" },
    {
      name: "description",
      content:
        "Free, privacy-first in-browser JSON visualizer. Transform raw JSON into interactive tables, inspect schemas, and run SQL queries locally with zero server uploads.",
    },
    {
      name: "keywords",
      content:
        "json visualizer, query json with sql, json to table, offline json viewer, json schema inspector, alasql in browser, privacy json formatter, json to csv converter, local data analysis",
    },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "JSON Visualiser" },
    { property: "og:title", content: "JSON Visualiser — Query JSON with SQL & Interactive Tables Locally" },
    {
      property: "og:description",
      content:
        "Transform raw JSON into interactive tables, inspect schemas, and run SQL queries locally with zero server uploads.",
    },
    { property: "og:url", content: "https://jsonvisualiser.com/" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "JSON Visualiser — In-Browser SQL & Table Tool for JSON" },
    {
      name: "twitter:description",
      content:
        "Transform raw JSON into interactive tables, inspect schemas, and execute SQL queries in your browser. 100% client-side privacy.",
    },
    { tagName: "link", rel: "canonical", href: "https://jsonvisualiser.com/" },
  ];
}

const FAQS = [
  {
    question: "How does in-browser SQL querying work on JSON files?",
    answer:
      "JSON Visualiser embeds AlaSQL, an in-memory SQL database engine executing directly in your browser's JavaScript runtime. It normalizes parsed JSON objects into relational tables, allowing you to run standard SQL queries including SELECT, WHERE, GROUP BY, aggregations (SUM, AVG, COUNT), and multi-dataset JOINs with sub-millisecond execution times without needing any backend server.",
  },
  {
    question: "Is my JSON data private and secure?",
    answer:
      "Yes, 100% private. JSON Visualiser runs entirely client-side in your browser. Your JSON datasets are never uploaded to any remote server, cloud API, or third-party analytics service. It is safe for sensitive API tokens, production database dumps, and GDPR/HIPAA-regulated records.",
  },
  {
    question: "What JSON structures are supported?",
    answer:
      "You can paste, drop, or import standard JSON arrays of objects, nested JSON hierarchies, key-value maps, or raw API response payloads. The app automatically inspects schemas, flattens nested properties into column paths, and presents clean spreadsheet tables.",
  },
  {
    question: "What is the file size limit for importing JSON?",
    answer:
      "Since processing happens locally, capacity is determined by your device's memory. JSON Visualiser easily handles datasets with tens of thousands of records. Datasets persist client-side in IndexedDB, completely bypassing the standard 5MB browser localStorage limits.",
  },
  {
    question: "Can I export data to CSV or formatted JSON?",
    answer:
      "Yes. You can export active tables, filtered views, or SQL query results with one click into standard CSV files or formatted JSON documents.",
  },
  {
    question: "Does JSON Visualiser work offline?",
    answer:
      "Yes. Once loaded, JSON Visualiser functions entirely without an active internet connection. You can use it securely in air-gapped environments or while traveling.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://jsonvisualiser.com/#app",
      "name": "JSON Visualiser",
      "url": "https://jsonvisualiser.com/",
      "description":
        "Transform raw JSON into interactive tables, inspect schemas, and execute SQL queries locally in your browser with 100% client-side privacy.",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "featureList": [
        "In-browser SQL engine powered by AlaSQL",
        "Interactive spreadsheet table with sorting and filtering",
        "Automated schema inference and type detection",
        "100% client-side execution with zero data transmission",
        "IndexedDB persistent local storage",
        "One-click export to CSV and JSON",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://jsonvisualiser.com/#faq",
      "mainEntity": FAQS.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer,
        },
      })),
    },
  ],
};

export default function Landing() {
  const { datasets, loadPresetDataset } = useWorkspace();
  const navigate = useNavigate();

  const handleLoadSample = async (presetItem: SampleDatasetPreset) => {
    await loadPresetDataset(presetItem);
    navigate('/workspace/data');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-4">
        {/* Privacy Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-xs font-semibold shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>100% Client-Side • Zero Data Ever Leaves Your Browser</span>
        </div>

        {/* Title with modern gradient */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          Transform & Query JSON{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
            Locally
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Paste or drop raw JSON. Explore data in a high-speed spreadsheet, inspect schemas, run real SQL queries locally with AlaSQL, and export to CSV or JSON with total privacy.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
          <Link
            to="/import"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            Paste or Upload JSON
          </Link>

          {datasets.length > 0 ? (
            <Link
              to="/workspace/data"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Table className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Open Active Workspace ({datasets.length} loaded)
            </Link>
          ) : (
            <button
              onClick={() => handleLoadSample(PRESET_DATASETS[0])}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Try Sample Dataset
            </button>
          )}
        </div>
      </div>

      {/* Primary Workflow Visualizer */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <h2 className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
          The Primary Workflow
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4 text-center">
          {[
            { step: '1', title: 'JSON Input', desc: 'Paste or drop JSON', icon: FileJson },
            { step: '2', title: 'Process JSON', desc: 'Flatten & infer schema', icon: Zap },
            { step: '3', title: 'Dataset', desc: 'Normalized tables', icon: Layers },
            { step: '4', title: 'Explore', desc: 'Search, sort, filter', icon: Table },
            { step: '5', title: 'SQL Query', desc: 'In-browser AlaSQL', icon: Terminal },
            { step: '6', title: 'Export', desc: 'Client-side CSV/JSON', icon: Download },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex flex-col items-center justify-between shadow-2xs hover:border-emerald-400 dark:hover:border-emerald-600/60 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-xs">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
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
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any dataset to load and jump straight into the workspace table view.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_DATASETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleLoadSample(preset)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                    {preset.filename}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {preset.data.length} records
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {preset.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Load into Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Data for Search Engines (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 space-y-2.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
            <HardDrive className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">IndexedDB Storage</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Datasets persist safely on your device in IndexedDB across browser refreshes without localStorage quota limits.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 space-y-2.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900/50">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">In-Browser SQL Engine</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Execute SQL queries with multi-dataset JOINs, aggregations, and sub-millisecond execution times in memory.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 space-y-2.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Zero Server Transmission</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your data is never transmitted to any remote server or third-party service. Works completely offline.
          </p>
        </div>
      </div>

      {/* Security & Comparison Callout */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20 dark:border-emerald-500/30 space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Built For Sensitive Production Data
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Why Developers Choose Local In-Browser Analysis Over Cloud Formatters
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Most online JSON viewers upload your payloads to remote servers for processing. JSON Visualiser runs 100% in your browser runtime—making it safe for confidential credentials, enterprise APIs, and customer records.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: "Zero Network Exfiltration",
              desc: "Payloads, tables, and query executions stay in your browser tab. Zero analytics, zero logging."
            },
            {
              title: "Relational SQL On Raw JSON",
              desc: "Skip complex regex and write standard ANSI SQL queries across one or multiple loaded datasets."
            },
            {
              title: "Automatic Schema Detection",
              desc: "Infers boolean, numeric, string, date, and nested objects with automatic flattening into spreadsheet rows."
            },
            {
              title: "Offline & Air-Gapped Ready",
              desc: "Runs smoothly without active WiFi or internet connection. Fully compliant with enterprise data protection."
            }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/50 dark:border-emerald-900/40">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) Section - Optimized for SEO & Search Snippets */}
      <div className="space-y-6 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Search & Developer FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Everything you need to know about in-browser JSON analysis, AlaSQL query execution, and data privacy.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, index) => (
            <details
              key={index}
              className="group p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all cursor-pointer shadow-2xs"
            >
              <summary className="flex items-center justify-between font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 list-none cursor-pointer select-none">
                <span>{faq.question}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0 ml-2" />
              </summary>
              <div className="pt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 mt-3">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
