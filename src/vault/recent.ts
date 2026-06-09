import { App, TFile } from "obsidian";

export function getRecentMarkdownFiles(
  app: App,
  limit = 12
): TFile[] {
  const files = app.vault
    .getMarkdownFiles()
    .slice()
    .sort((a, b) => b.stat.mtime - a.stat.mtime);
  return files.slice(0, limit);
}
