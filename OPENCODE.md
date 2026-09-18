# OPENCODE.md — OpenCode Instructions for JSON Visualiser Studio

This document provides project rules, runtime context, and conventions for **OpenCode** agents working in **JSON Visualiser Studio**. It is referenced in `opencode.json`.

---

## 🛠️ Essential Commands

```bash
# Start local development server (Vite on http://localhost:5173)
npm run dev

# Run TypeScript typecheck (React Router typegen + tsc)
npm run typecheck

# Build for production (SSR + Client)
npm run build

# Start production server
npm run start
```
*Windows Shell Note*: Use `npm.cmd` if execution policies restrict `.ps1` scripts.

---

## 🔒 Cardinal Rule: 100% Client-Side Privacy

- **Zero Server Transmission**: User data must never be transmitted outside the browser. Do not add cloud storage, tracking scripts, or remote endpoints.
- **Client Processing**: Parsing, schema inference, auto-flattening, and AlaSQL queries run entirely in the browser engine.
- **Persistent Storage**:
  - **IndexedDB**: DB `JsonVisualiserStudioDb`, object store `JsonVisualiserStudio` via `idb-keyval` custom store in `app/lib/storage.ts`.
  - **localStorage**: User preferences (`json_vis_settings`), query history, saved queries.

---

## ⚙️ OpenCode Configuration (`opencode.json`)

The workspace root contains `opencode.json` configured with:
- **Server**: Configured for `localhost:5173` with CORS enabled.
- **Permissions**: Safe bash commands (`npm run *`, `npm.cmd *`, `npx *`) allowed, destructive actions (`rm -rf *`) denied.
- **Watcher**: Ignores `node_modules/`, `build/`, `.react-router/`, and `.git/`.
- **Instructions**: Points to `OPENCODE.md` and `AGENTS.md`.

---

## 🏛️ Project Structure

```text
app/
├── root.tsx                  # HTML shell, pre-hydration theme script, command palette
├── routes.ts                 # React Router v8 route configuration
├── app.css                   # Tailwind CSS v4, dark mode tokens, .ambient-glow
├── context/
│   └── WorkspaceContext.tsx  # Global state (datasets, active dataset, settings)
├── types/                    # dataset.ts, query.ts, settings.ts
├── lib/
│   ├── storage.ts            # IndexedDB (JsonVisualiserStudioDb) & localStorage
│   ├── json-processor.ts     # JSON parsing, schema inference, format & minify
│   ├── sql-engine.ts         # In-memory AlaSQL execution
│   └── export-utils.ts       # CSV, TSV, Markdown, JSON export
├── components/
│   ├── dataset/              # Virtualized table view (@tanstack/react-virtual)
│   ├── query/                # SQL editor & query results
│   ├── json-input/           # Paste & drag-drop file dropzone
│   ├── export/               # Multi-format export modal
│   └── layout/               # Header, CommandPalette, ShortcutsModal
└── routes/
    ├── landing.tsx           # Home page ("/")
    ├── formatter.tsx         # JSON Formatter & Minifier ("/formatter")
    ├── import.tsx            # JSON file dropzone & paste ("/import")
    ├── settings.tsx          # Settings & storage manager ("/settings")
    └── workspace/            # Nested workspace routes ("/workspace/*")
```

---

## 📐 Agent Guidelines

1. **Strict TypeScript**: Always verify changes with `npm run typecheck`. Maintain type integrity using models from `app/types/`.
2. **SSR Compatibility**: Protect all browser-only APIs (`window`, `localStorage`, `indexedDB`, `navigator`) with `typeof window !== 'undefined'`.
3. **Table Virtualization**: Always use `@tanstack/react-virtual` for data table rendering to ensure high performance with large datasets.
4. **Tailwind CSS v4**: Dark mode is class-based (`dark:...`). Use obsidian backgrounds with subtle `.ambient-glow` backing.
5. **Icons**: Use `lucide-react` icons imported from the root package.
