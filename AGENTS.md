# AGENTS.md — Universal Agent Instructions for JSON Visualiser Studio

This repository contains specialized agent configuration files and memory directives optimized for major AI programming assistants according to their official documentation standards:

| Assistant / Ecosystem | Primary Spec & Config Files | Official Reference |
| :--- | :--- | :--- |
| **Anthropic Claude** | [`CLAUDE.md`](./CLAUDE.md), [`.claude/settings.json`](./.claude/settings.json), [`.claude/rules/`](./.claude/rules/) | [Claude Code Directory Docs](https://code.claude.com/docs/en/claude-directory) |
| **Google Gemini** | [`GEMINI.md`](./GEMINI.md) | [Gemini CLI Memory Management](https://geminicli.com/docs/cli/tutorials/memory-management/) |
| **OpenCode** | [`opencode.json`](./opencode.json), [`OPENCODE.md`](./OPENCODE.md) | [OpenCode Server & Config Docs](https://opencode.ai/docs/config/#server) |

---

## 📌 Project Identity & Mission

- **Project**: JSON Visualiser Studio (`json-visualiser-app`)
- **Type**: 100% client-side privacy-first web application built with React 19, React Router v8, Tailwind CSS v4, AlaSQL, TanStack Virtual, and Vite.
- **Privacy Guarantee**: **Zero Server Transmission**. All JSON formatting, flattening, schema generation, SQL execution, and table visualization execute purely inside the client's browser runtime. No data is ever sent to external clouds or servers.

---

## 🛠️ Verification & Build Commands

```bash
# Start local development server (Vite on http://localhost:5173)
npm run dev

# Run TypeScript compiler & React Router route typegen (Always run after edits)
npm run typecheck

# Compile SSR and client production bundles
npm run build

# Run production server locally
npm run start
```
*Windows Shell Note*: In PowerShell environments where script execution policies restrict `.ps1`, use `npm.cmd` (e.g. `npm.cmd run typecheck`).

---

## 💾 Client Storage Boundaries

- **IndexedDB**:
  - Database Name: `JsonVisualiserStudioDb`
  - Object Store: `JsonVisualiserStudio`
  - Managed by `app/lib/storage.ts` using `idb-keyval` custom store to store datasets without size limitations.
- **localStorage**:
  - `json_vis_settings`: Theme preference, row density, pagination defaults, SQL defaults.
  - `json_vis_query_history`: Chronological query execution history (max 100).
  - `json_vis_saved_queries`: User bookmarked SQL queries.

---

## 🏛️ Directory Layout

```text
json-visualiser-app/
├── .claude/                  # Claude Code config, permissions & rules
│   ├── settings.json         # Tool permissions & safety guards
│   ├── rules/                # Scoped rules (client-privacy.md, react-virtualization.md)
│   └── skills/               # Reusable skills (/typecheck)
├── app/
│   ├── root.tsx              # Root HTML shell, dark mode inline script, global header
│   ├── routes.ts             # Route definitions (@react-router/dev/routes)
│   ├── app.css               # Tailwind CSS v4 directives, color tokens, .ambient-glow
│   ├── context/              # WorkspaceContext.tsx (state provider)
│   ├── types/                # dataset.ts, query.ts, settings.ts
│   ├── lib/                  # storage.ts, sql-engine.ts, json-processor.ts, export-utils.ts
│   ├── components/           # dataset/, query/, json-input/, export/, layout/, common/
│   └── routes/               # landing.tsx, formatter.tsx, import.tsx, settings.tsx, workspace/
├── AGENTS.md                 # Universal multi-agent entrypoint (this file)
├── CLAUDE.md                 # Claude Code CLI project context (< 200 lines)
├── GEMINI.md                 # Gemini CLI persistent memory document
├── opencode.json             # OpenCode runtime configuration (server, permissions, watcher)
└── OPENCODE.md               # OpenCode agent rules & guidelines
```

---

## ⚖️ Common Agent Rules Across All Models

1. **Maintain Zero-Telemetry Privacy**: Never add fetch/XHR calls that transmit user data to any external destination.
2. **Never Break SSR**: Guard `window`, `document`, `localStorage`, and `indexedDB` accesses with `typeof window !== 'undefined'`.
3. **Always Verify**: Run `npm run typecheck` (or `npm.cmd run typecheck`) after modifying code to verify type compatibility.
4. **Use Virtualization**: Large tables must render with `@tanstack/react-virtual` for 60fps performance.
