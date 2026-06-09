import { App, TFile } from "obsidian";
import { isReadablePath } from "../config/folder-policy";

export function getRecentMarkdownFiles(
  app: App,
  limit = 12
): TFile[] {
  const files = app.vault
    .getMarkdownFiles()
    .filter((file) => isReadablePath(file.path))
    .sort((a, b) => b.stat.mtime - a.stat.mtime);
  return files.slice(0, limit);
}
