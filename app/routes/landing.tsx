import { useState } from 'react';
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
  ArrowUpRight,
  Database,
  Download,
  Layers,
  Lock,
  HardDrive,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  Braces,
  Search,
  FileSpreadsheet,
  Wand2,
  Play,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PRESET_DATASETS, SAMPLE_USERS, type SampleDatasetPreset } from '../lib/sample-data';

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

const WORKFLOW_STEPS = [
  {
    title: 'Drop in JSON',
    desc: 'Paste, drag-drop, or import a file',
    tag: 'users.json',
    to: '/import',
    icon: FileJson,
  },
  {
    title: 'Validate & format',
    desc: 'Pretty-print and pinpoint syntax errors',
    tag: 'format · minify',
    to: '/formatter',
    icon: Zap,
  },
  {
    title: 'Flatten & schema',
    desc: 'Nested objects become queryable columns',
    tag: 'address.city',
    to: '/workspace/schema',
    icon: Layers,
  },
  {
    title: 'Explore table',
    desc: 'Search, sort, and filter at 60fps',
    tag: '10k+ rows',
    to: '/workspace/data',
    icon: Search,
  },
  {
    title: 'Query with SQL',
    desc: 'JOINs, GROUP BY, and aggregations',
    tag: 'AlaSQL',
    to: '/workspace/query',
    icon: Terminal,
  },
  {
    title: 'Export results',
    desc: 'Download filtered views or answers',
    tag: 'CSV / JSON',
    to: '/workspace/data',
    icon: Download,
  },
] as const;

const PRESET_QUERIES: Record<string, string> = {
  preset_users: 'SELECT country, COUNT(*) AS users FROM users GROUP BY country',
  preset_orders: 'SELECT status, SUM(total) AS revenue FROM orders GROUP BY status',
  preset_products: 'SELECT category, AVG(price) AS avg_price FROM products GROUP BY category',
};

const DEMO_ROWS = SAMPLE_USERS.slice(0, 4);

const STATS = [
  { value: '0 bytes', label: 'uploaded to any server' },
  { value: '<50 ms', label: 'typical SQL execution' },
  { value: '100%', label: 'offline-capable & free' },
  { value: '10k+ rows', label: 'handled with virtualization' },
] as const;

const TOOLS = [
  {
    to: '/formatter',
    icon: Wand2,
    title: 'Formatter & Validator',
    desc: 'Pretty-print, minify, and validate JSON with instant error locations.',
  },
  {
    to: '/import',
    icon: Braces,
    title: 'Import & Flatten',
    desc: 'Paste raw payloads or drop files. Nested objects become queryable columns.',
  },
  {
    to: '/workspace/query',
    icon: Terminal,
    title: 'SQL Workbench',
    desc: 'JOIN multiple datasets, aggregate, and save queries — all in memory.',
  },
  {
    to: '/workspace/data',
    icon: FileSpreadsheet,
    title: 'Spreadsheet View',
    desc: 'Virtualized table with sorting, filtering, and density controls.',
  },
] as const;

export default function Landing() {
  const { datasets, loadPresetDataset } = useWorkspace();
  const navigate = useNavigate();
  const [loadingPresetId, setLoadingPresetId] = useState<string | null>(null);

  const handleLoadSample = async (presetItem: SampleDatasetPreset) => {
    if (loadingPresetId) return;
    setLoadingPresetId(presetItem.id);
    try {
      await loadPresetDataset(presetItem);
      navigate('/workspace/data');
    } finally {
      setLoadingPresetId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 space-y-16 sm:space-y-20">
      {/* Hero Section */}
      <section aria-labelledby="landing-hero" className="text-center space-y-6 max-w-3xl mx-auto pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-xs font-semibold shadow-2xs">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span>100% Client-Side • Zero Data Ever Leaves Your Browser</span>
        </div>

        <h1
          id="landing-hero"
          className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.05]"
        >
          Turn messy JSON into{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
            tables & SQL answers
          </span>{' '}
          instantly
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Paste or drop raw JSON. Explore it in a high-speed spreadsheet, inspect auto-inferred schemas,
          run real SQL with AlaSQL, and export to CSV — all locally, with total privacy.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link
            to="/import"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" aria-hidden="true" />
            Paste or Upload JSON
          </Link>

          {datasets.length > 0 ? (
            <Link
              to="/workspace/data"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Table className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Open Workspace ({datasets.length} loaded)
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => handleLoadSample(PRESET_DATASETS[0])}
              disabled={loadingPresetId !== null}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              {loadingPresetId ? 'Loading sample…' : 'Try Sample Dataset — no upload'}
            </button>
          )}
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          {['No signup required', 'Works offline', 'Free forever'].map((item) => (
            <li key={item} className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Live transformation demo */}
      <section aria-labelledby="landing-demo" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="landing-demo" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              See the transformation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Raw nested JSON → flat table → SQL answer. This is a static preview — the real thing runs live in your browser.
            </p>
          </div>
          <Link
            to="/formatter"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:gap-2.5 transition-all"
          >
            Open formatter <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm">
          {/* Mock window chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-200/70 dark:border-slate-800/70 bg-slate-50/80 dark:bg-slate-950/40" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-3 font-mono text-[11px] text-slate-400 dark:text-slate-500">users.json → SQL → result.csv — local only</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-4 sm:p-5 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200/70 dark:border-slate-800/70">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  <Braces className="w-3.5 h-3.5" aria-hidden="true" /> Input JSON
                </p>
                <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-200">
                  <code>{`{\n  "id": 1,\n  "name": "Rahul Khimsuriya",\n  "address": {\n    "city": "Ahmedabad",\n    "geo": { "lat": 23.02, "lng": 72.57 }\n  },\n  "role": "Admin"\n}`}</code>
                </pre>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  <Terminal className="w-3.5 h-3.5" aria-hidden="true" /> SQL in browser
                </p>
                <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-emerald-200">
                  <code>{`SELECT name, address.city AS city,\n       role FROM users\nWHERE active = TRUE\nLIMIT 4;`}</code>
                </pre>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-slate-50/60 dark:bg-slate-950/30">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                <Table className="w-3.5 h-3.5" aria-hidden="true" /> Result table — flattened
              </p>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                      <th scope="col" className="px-3 py-2 font-semibold whitespace-nowrap">name</th>
                      <th scope="col" className="px-3 py-2 font-semibold whitespace-nowrap">address.city</th>
                      <th scope="col" className="px-3 py-2 font-semibold whitespace-nowrap">role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-200">
                    {DEMO_ROWS.map((row) => (
                      <tr key={row.id}>
                        <td className="px-3 py-2 whitespace-nowrap font-medium">{row.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{row.address.city}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                            {row.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                Nested <code className="font-mono px-1 rounded bg-slate-200/70 dark:bg-slate-800">address.geo</code> auto-flattened. Nothing uploaded.
              </p>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 text-center shadow-2xs"
            >
              <dt className="order-2 mt-1 block text-[11px] text-slate-500 dark:text-slate-400">{stat.label}</dt>
              <dd className="order-1 text-lg font-black tracking-tight text-slate-900 dark:text-white">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Primary Workflow */}
      <section aria-labelledby="landing-workflow" className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent"
        />
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-8 sm:mb-10">
          <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            How it works
          </p>
          <h2 id="landing-workflow" className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            From raw JSON to answers in six steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Every step runs locally in this tab — no upload, no queue, no backend.
            Click any step to jump straight to that tool.
          </p>
        </div>

        <ol className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 list-none m-0 p-0">
          <div
            aria-hidden="true"
            className="hidden xl:block absolute top-10 left-[8%] right-[8%] h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"
          />
          {WORKFLOW_STEPS.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === WORKFLOW_STEPS.length - 1;
            return (
              <li key={item.title} className="relative">
                <Link
                  to={item.to}
                  aria-label={`Step ${idx + 1}: ${item.title} — open ${item.to}`}
                  className="group relative flex h-full flex-col p-5 pt-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/15 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2 transition-all"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -top-3 left-4 inline-flex items-center justify-center h-6 px-2.5 rounded-full bg-emerald-500 text-white text-[11px] font-black tracking-wide shadow-md shadow-emerald-500/30 ring-1 ring-emerald-600/40"
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="absolute top-4 right-4 w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-focus-visible:opacity-100 transition-all"
                  />
                  {!isLast && (
                    <ArrowRight
                      aria-hidden="true"
                      className="hidden xl:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10 w-6 h-6 p-1 rounded-full bg-emerald-500 text-white border border-emerald-400 shadow-md shadow-emerald-500/40 items-center justify-center"
                    />
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shadow-xs group-hover:bg-emerald-500/25 group-hover:border-emerald-400/60 transition-colors">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Step {idx + 1}
                    </p>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="mt-auto pt-3 min-w-0">
                    <span className="inline-block max-w-full whitespace-nowrap overflow-hidden text-ellipsis align-middle font-mono text-[10px] px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      {item.tag}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 flex flex-wrap items-center justify-center gap-1.5 text-center text-xs text-slate-600 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          Paste → export in under 10 seconds.
          <span className="font-semibold text-slate-800 dark:text-white">Everything stays in this tab.</span>
        </p>
      </section>

      {/* 1-Click Sample Presets */}
      <section aria-labelledby="landing-samples" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="landing-samples" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Quick-start datasets
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              One click loads a dataset and jumps straight into the workspace table view.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            JOIN-ready via <code>user_id</code>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_DATASETS.map((preset) => {
            const isLoading = loadingPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadSample(preset)}
                disabled={loadingPresetId !== null}
                aria-label={`Load ${preset.filename} sample dataset into workspace`}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between text-left disabled:opacity-60 disabled:cursor-wait disabled:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2"
              >
                <span className="block">
                  <span className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                      {preset.filename}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {preset.data.length} records
                    </span>
                  </span>
                  <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {preset.name}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {preset.description}
                  </span>
                  {PRESET_QUERIES[preset.id] && (
                    <span className="block mt-3 font-mono text-[11px] leading-relaxed px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-300 overflow-x-auto whitespace-nowrap">
                      {PRESET_QUERIES[preset.id]}
                    </span>
                  )}
                </span>

                <span className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>{isLoading ? 'Loading…' : 'Load into Workspace'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tools grid */}
      <section aria-labelledby="landing-tools" className="space-y-4">
        <div>
          <h2 id="landing-tools" className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Everything you need, one tab away
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Formatter, importer, SQL workbench, and virtualized tables share the same local workspace.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.to + tool.title}
                to={tool.to}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 hover:border-emerald-500/70 dark:hover:border-emerald-500/60 hover:-translate-y-0.5 transition-all group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 border border-emerald-100 dark:border-emerald-900/50">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{tool.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Open <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Structured Data for Search Engines (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Feature Highlights Grid */}
      <section aria-labelledby="landing-features" className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <h2 id="landing-features" className="sr-only">Key features</h2>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 space-y-2.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
            <HardDrive className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">IndexedDB Storage</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Datasets persist safely on your device in IndexedDB across browser refreshes without localStorage quota limits.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 space-y-2.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900/50">
            <Terminal className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">In-Browser SQL Engine</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Execute SQL queries with multi-dataset JOINs, aggregations, and sub-millisecond execution times in memory.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 space-y-2.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
            <Lock className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Zero Server Transmission</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your data is never transmitted to any remote server or third-party service. Works completely offline.
          </p>
        </div>
      </section>

      {/* Security & Comparison Callout */}
      <section aria-labelledby="landing-privacy" className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20 dark:border-emerald-500/30 space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Built For Sensitive Production Data
          </div>
          <h2 id="landing-privacy" className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Why developers choose local analysis over cloud formatters
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Most online JSON viewers upload your payloads to remote servers for processing. JSON Visualiser runs 100% in your browser runtime — safe for credentials, enterprise APIs, and customer records.
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
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/50 dark:border-emerald-900/40">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section - Optimized for SEO & Search Snippets */}
      <section aria-labelledby="landing-faq" className="space-y-6 pt-2">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
            <span>Search & Developer FAQ</span>
          </div>
          <h2 id="landing-faq" className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Everything you need to know about in-browser JSON analysis, AlaSQL query execution, and data privacy.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, index) => (
            <details
              key={faq.question}
              open={index === 0}
              className="group p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all cursor-pointer shadow-2xs"
            >
              <summary className="flex items-center justify-between font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 list-none cursor-pointer select-none">
                <span>{faq.question}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0 ml-2" aria-hidden="true" />
              </summary>
              <div className="pt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 mt-3">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section aria-labelledby="landing-cta" className="overflow-hidden rounded-3xl border border-emerald-500/25 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-6 py-10 sm:px-10 text-center text-white shadow-lg shadow-emerald-500/20">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold backdrop-blur">
            <Database className="w-4 h-4" aria-hidden="true" />
            {datasets.length > 0 ? `${datasets.length} dataset${datasets.length === 1 ? '' : 's'} ready in this browser` : 'No upload • No account • No tracking'}
          </div>
          <h2 id="landing-cta" className="text-2xl sm:text-3xl font-black tracking-tight">
            Inspect your JSON without sending it anywhere
          </h2>
          <p className="text-sm text-emerald-50/90 leading-relaxed">
            Format, flatten, query, and export — entirely on your device. Start with a sample or bring your own file.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              to="/import"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow hover:bg-emerald-50 active:scale-[0.98] transition-all"
            >
              <UploadCloud className="w-4 h-4" aria-hidden="true" />
              Start with your JSON
            </Link>
            <Link
              to="/workspace/query"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 active:scale-[0.98] transition-all"
            >
              <Terminal className="w-4 h-4" aria-hidden="true" />
              Open SQL workbench
            </Link>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer
        aria-label="Footer"
        className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 px-6 py-8 sm:px-10 shadow-2xs"
      >
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                <FileJson className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                JSON Visualiser
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Privacy-first JSON toolkit — format, flatten, query with SQL, and export,
              entirely in your browser.
            </p>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              100% client-side · zero uploads
            </p>
          </div>

          <nav aria-label="Tools">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Tools
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/formatter" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Formatter & Validator
                </Link>
              </li>
              <li>
                <Link to="/import" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Import JSON
                </Link>
              </li>
              <li>
                <Link to="/workspace/query" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  SQL Workbench
                </Link>
              </li>
              <li>
                <Link to="/workspace/data" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Spreadsheet View
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Workspace">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Workspace
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/workspace/schema" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Schema Inspector
                </Link>
              </li>
              <li>
                <Link to="/workspace/saved" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Saved Queries
                </Link>
              </li>
              <li>
                <Link to="/workspace/history" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Query History
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Product">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Product
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/import" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <Link to="/formatter" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Format JSON
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Storage & Privacy
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-8 pt-5 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} JSON Visualiser · Free forever</p>
          <p className="inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
            No tracking · No uploads · Works offline
          </p>
        </div>
      </footer>
    </div>
  );
}
