# GEMINI.md — Gemini CLI & Agent Memory Guide

This document provides persistent context, project constraints, and architectural instructions for **Gemini CLI** and Google Gemini models assisting with **JSON Visualiser Studio**.

---

## 🧠 Memory Management & CLI Commands

Gemini CLI automatically discovers and loads this `GEMINI.md` into the agent's active memory context at session start.

- **Inspect Loaded Context**: `/memory show` (verifies active memory hierarchy and facts)
- **Force Context Reload**: `/memory refresh` (re-scans and reloads `GEMINI.md` across workspace)
- **Initialize Workspace Context**: `/init` (generates or resets project-level context)

---

## 🛑 Negative Constraints & Hard Rules

- **DO NOT** send any user JSON datasets, SQL queries, or schema models to external servers, cloud APIs, or remote telemetry endpoints.
- **DO NOT** break SSR: never invoke `window`, `document`, `localStorage`, or `indexedDB` without verifying `typeof window !== 'undefined'`.
- **DO NOT** use loose `any` types in TypeScript code. Maintain explicit type definitions in `app/types/`.
- **DO NOT** use React class components. Use modern functional components with hooks (`useState`, `useMemo`, `useCallback`, `useRef`).
- **DO NOT** render unvirtualized tables for datasets. High-throughput data tables must use `@tanstack/react-virtual`.

---

## ⚡ Fast Reference: Commands & Toolchain

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Run Vite HMR dev server (`http://localhost:5173`) |
| `npm run typecheck` | Run React Router route typegen + `tsc` compiler |
| `npm run build` | Build SSR and client production bundles |
| `npm run start` | Serve production build locally |

*Windows Note*: If script execution policies block `npm.ps1`, execute via `npm.cmd` (e.g. `npm.cmd run typecheck`).

---

## 💾 Storage & Data Architecture

- **IndexedDB**:
  - Database Name: `JsonVisualiserStudioDb`
  - Object Store: `JsonVisualiserStudio`
  - Configured in `app/lib/storage.ts` using `idb-keyval`'s `createStore`.
  - Holds full dataset records to avoid `localStorage` size limits.
- **localStorage**:
  - `json_vis_settings`: App theme (`light` / `dark` / `system`), row density, pagination defaults.
  - `json_vis_query_history`: Chronological SQL history (max 100).
  - `json_vis_saved_queries`: Saved SQL snippets.
- **In-Memory SQL**:
  - AlaSQL runs client-side inside `app/lib/sql-engine.ts`.
  - Real-time execution duration tracking in milliseconds.

---

## 🎨 UI & Design System

- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`).
- **Theme**: Dark obsidian `#080b12` background with cyan & emerald radial ambient lighting (`.ambient-glow`).
- **Glassmorphism**: Translucent panels (`bg-white/70 dark:bg-slate-900/50 backdrop-blur-md`) with soft slate borders (`border-slate-200/80 dark:border-slate-800/80`).
- **Icons**: `lucide-react` icons.
