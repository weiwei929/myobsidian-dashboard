export type DashboardRoute =
  | { type: "home" }
  | { type: "folder"; path: string }
  | { type: "document"; path: string };
