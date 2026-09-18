# CLAUDE.md — Agent Guidelines for JSON Visualiser Studio

This document provides project instructions, commands, and architectural conventions for Anthropic Claude (Claude Code CLI, Claude Desktop, and Claude tools).

---

## 🚀 Commands & Development

| Task | Command | Notes |
| :--- | :--- | :--- |
| **Dev Server** | `npm run dev` | Runs Vite HMR server on `http://localhost:5173` |
| **Type Check** | `npm run typecheck` | Runs `react-router typegen && tsc` (always verify after edits) |
| **Build** | `npm run build` | Compiles client and SSR bundles via React Router |
| **Start** | `npm run start` | Serves production build locally |

*Windows Shell Note*: Use `npm.cmd` when PowerShell script execution policies restrict `npm.ps1`.

---

## 🛡️ Core Directive: 100% Client-Side Privacy

**Zero user data may ever leave the browser.**
- **No Remote Telemetry or Cloud Transmission**: Do not introduce network calls, cloud databases, external endpoints, or remote tracking for user JSON datasets or queries.
- **Pure Client Processing**: Parsing, schema inference, auto-flattening, formatting, and SQL executions run strictly in-memory (AlaSQL) inside the user's browser runtime.
- **Browser Persistence**:
  - **IndexedDB**: Database `JsonVisualiserStudioDb`, object store `JsonVisualiserStudio` (via `app/lib/storage.ts` with `idb-keyval`).
  - **localStorage**: Application preferences (`json_vis_settings`), query history, saved queries.

---

## 🏛️ Architecture & Source Organization

```text
json-visualiser-app/
├── .claude/                  # Claude Code configurations, rules, and skills
│   ├── settings.json         # Tool permissions & safety guards
│   ├── rules/                # Path-scoped instructions (client-privacy, virtualization)
│   └── skills/               # Reusable skills (/typecheck)
├── app/
│   ├── root.tsx              # Root HTML shell, dark mode hydration script, global header
│   ├── routes.ts             # Route definitions (@react-router/dev/routes)
│   ├── app.css               # Tailwind CSS v4, dark tokens, .ambient-glow
│   ├── context/              # WorkspaceContext.tsx (state provider)
│   ├── types/                # dataset.ts, query.ts, settings.ts
│   ├── lib/                  # storage.ts, sql-engine.ts, json-processor.ts, export-utils.ts
│   ├── components/           # dataset/, query/, json-input/, export/, layout/, common/
│   └── routes/               # landing.tsx, formatter.tsx, import.tsx, settings.tsx, workspace/
```

---

## 📐 Conventions & Rules

1. **Strict TypeScript**: Avoid `any`. Use strongly-typed schemas and interfaces from `app/types/`.
2. **SSR Guarding**: Always wrap browser APIs (`window`, `localStorage`, `indexedDB`, `navigator`) with `typeof window !== 'undefined'`.
3. **Table Virtualization**: Always use `@tanstack/react-virtual` for row rendering in dataset tables.
4. **Tailwind CSS v4**: Dark mode uses `@custom-variant dark (&:is(.dark, .dark *));`. Maintain glassmorphic panels with `.ambient-glow` backing.
5. **Icons**: Use `lucide-react` directly.
