import { type RouteConfig, index, route, layout, prefix } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route("formatter", "routes/formatter.tsx"),
  route("import", "routes/import.tsx"),
  ...prefix("workspace", [
    layout("routes/workspace-layout.tsx", [
      index("routes/workspace/index.tsx"),
      route("data", "routes/workspace/data.tsx"),
      route("query", "routes/workspace/query.tsx"),
      route("schema", "routes/workspace/schema.tsx"),
      route("history", "routes/workspace/history.tsx"),
      route("saved", "routes/workspace/saved.tsx"),
    ]),
  ]),
  route("settings", "routes/settings.tsx"),
] satisfies RouteConfig;
