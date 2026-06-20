import { App, TFile } from "obsidian";
import { isReadablePath } from "../config/folder-policy";
import type { DashboardSettings } from "../config/settings";

export function getRecentMarkdownFiles(
  app: App,
  settings: DashboardSettings,
  limit = 12
): TFile[] {
  const files = app.vault
    .getMarkdownFiles()
    .filter((file) => isReadablePath(file.path, settings))
    .sort((a, b) => b.stat.mtime - a.stat.mtime);
  return files.slice(0, limit);
}
