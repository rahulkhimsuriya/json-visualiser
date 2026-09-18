---
paths:
  - "app/**/*"
---

# Client-Side Privacy Rules

- **Zero Server Transmission**: Never introduce any external network call, cloud API, remote analytics, or remote database endpoint that receives user JSON data, schemas, or query results.
- **Pure Client-Side Processing**: All JSON parsing, formatting, schema generation, flattening, and SQL queries must run in-browser (via JavaScript and in-memory AlaSQL).
- **Client Storage Boundary**: Only persist data to IndexedDB (`JsonVisualiserStudioDb` with object store `JsonVisualiserStudio`) and `localStorage`.
- **SSR Safety**: Always check `typeof window !== 'undefined'` before accessing client-only APIs (`window`, `localStorage`, `indexedDB`, `navigator`).
