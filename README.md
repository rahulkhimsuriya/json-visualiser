# JSON Visualiser Studio

> **A fast, privacy-first, browser-based JSON data studio.**  
> Ingest, normalize, query with SQL, explore with virtualized tables, and export datasets—**100% locally in your browser**. Zero server uploads.

![Privacy First](https://img.shields.io/badge/Privacy-100%25%20Local%20Browser-emerald?style=flat-square)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square)
![React Router](https://img.shields.io/badge/React%20Router-v7%2B-red?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-gray?style=flat-square)

---

## 🌟 Overview

Most JSON viewers only display raw trees or format strings. **JSON Visualiser** transforms messy or nested JSON payloads into structured tabular datasets, extracts schema types, lets you run complex **SQL queries** right in the browser, and exports clean results in multiple formats.

### 🛡️ Privacy Guarantee
**Your data never leaves your machine.**
- All JSON parsing, normalization, schema inference, and SQL execution occur client-side inside your browser sandbox.
- Query history, saved queries, and session state are persisted securely in your local browser storage ([IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)).
- No telemetry or external server tracking of user data payloads.

---

## ✨ Features

- **📥 Flexible JSON Ingestion**:
  - Paste raw JSON with automatic formatting and syntax validation.
  - File upload via click or drag-and-drop (`.json` files).
  - Quick-start sample datasets (E-commerce Orders, User Profiles, GitHub API events).
- **🔄 Intelligent Normalization**:
  - Automatically handles objects, arrays of objects, nested JSON, primitive arrays, and key-value records.
  - Generates schema definitions with detected data types (`string`, `number`, `boolean`, `date`, `object`, `array`).
- **📊 High-Performance Virtualized Table**:
  - Powered by `@tanstack/react-virtual` for buttery-smooth 60fps rendering across thousands of rows.
  - Multi-column sorting (ascending, descending).
  - Column filtering with operators (`contains`, `equals`, `starts with`, `greater than`, `less than`, `is empty`).
  - Column visibility toggle and global search with match highlighting.
- **⚡ In-Browser SQL Studio**:
  - Powered by **AlaSQL** running purely in-memory.
  - Write standard SQL against your dataset: `SELECT`, `WHERE`, `ORDER BY`, `GROUP BY`, `HAVING`, `LIMIT`, and aggregate functions (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`).
  - Pre-built query snippets (Select All, Aggregation, Top Records, Filtering).
  - Query history tracking with execution time metrics and one-click re-run.
  - Bookmark & organize frequently used queries with custom titles.
- **🎨 Modern Emerald & Teal Design System**:
  - Clean, high-contrast Light and Dark modes.
  - Fully responsive layout across desktop and mobile screens.
  - Customizable table density (compact, comfortable, spacious) and optional row numbering.
- **⌨️ Keyboard Shortcuts & Command Palette**:
  - Open the Global Command Palette anytime with `Ctrl + K` (or `Cmd + K`).
  - Execute queries instantly with `Ctrl + Enter` (or `Cmd + Enter`).
- **📤 Versatile Exporting**:
  - Export original datasets or query results.
  - Supported formats: **JSON**, **CSV**, **TSV**, and **Markdown Table**.

---

## 🚀 Primary Workflow

```text
┌────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   JSON Input   │ ──> │ Normalize & Schema  │ ──> │ Table & Explorer │
│  Paste/Upload  │     │   Auto-detect types │     │ Virtualized grid │
└────────────────┘     └─────────────────────┘     └──────────────────┘
                                                             │
                                                             ▼
┌────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│ Multi-format   │ <── │ Query Results View  │ <── │ SQL Query Studio │
│ Export (CSV/..)│     │ Inspect & Sort rows │     │ AlaSQL in memory │
└────────────────┘     └─────────────────────┘     └──────────────────┘
```

---

## 🧭 Application Routes

| Route | Description |
| :--- | :--- |
| `/` | **Landing Page**: Feature overview, workflow summary, and quick-start dataset loaders. |
| `/import` | **JSON Input**: Textarea paste, drag-and-drop dropzone, format checker, and sample data picker. |
| `/workspace` | **Workspace Overview**: High-level dataset metrics, schema summary, and quick action cards. |
| `/workspace/data` | **Data Explorer**: Full-page virtualized data table with search, sorting, and column filters. |
| `/workspace/query` | **SQL Query Studio**: Interactive SQL editor, schema column reference, and instant result table. |
| `/workspace/schema` | **Schema Inspector**: Column data types, sample values, null counts, and column metadata. |
| `/workspace/history` | **Query History**: Audit log of previously run queries with execution durations and one-click execution. |
| `/workspace/saved` | **Saved Queries**: Bookmarked SQL templates with custom titles and quick-run actions. |
| `/settings` | **Preferences**: Appearance (Light / Dark / System), table row density, row numbering, and data clearance. |

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [React Router v7/v8](https://reactrouter.com/) (SSR & Client Routing)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with modern `@custom-variant dark` support
- **In-Memory SQL**: [AlaSQL](https://github.com/AlaSQL/alasql)
- **Virtualization**: [@tanstack/react-virtual](https://tanstack.com/virtual/latest)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Local Storage**: [idb-keyval](https://github.com/jakearchibald/idb-keyval) (IndexedDB wrapper)
- **Build Tool**: [Vite 8](https://vitejs.dev/)

---

## 💻 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**, **pnpm**, or **yarn**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/json-visualiser-app.git
   cd json-visualiser-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite development server with Hot Module Replacement (HMR). |
| `npm run build` | Builds the production server and client bundles. |
| `npm run start` | Runs the production build using `@react-router/serve`. |
| `npm run typecheck` | Generates React Router types and runs TypeScript compiler (`tsc`). |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Toggle the Global Command Palette |
| `Ctrl + Enter` / `Cmd + Enter` | Run SQL query (while in the SQL editor) |
| `Esc` | Close open modals / drawers / palettes |

---

## 🔒 Security & Privacy Notice

This application is strictly designed for local operation. When you inspect confidential documents, production logs, or API responses, no data packet is transmitted over the network. You can safely inspect sensitive JSON payloads without compliance or data privacy concerns.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
