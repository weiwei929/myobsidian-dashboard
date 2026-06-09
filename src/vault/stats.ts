import { App, TFile, TFolder } from "obsidian";
import { SectionMeta } from "../config/sections";

export interface SectionStats {
  meta: SectionMeta;
  fileCount: number;
  latestFile: TFile | null;
  latestMtime: number;
}

function collectMarkdownFiles(folder: TFolder): TFile[] {
  const files: TFile[] = [];
  const walk = (node: TFolder) => {
    for (const child of node.children) {
      if (child instanceof TFile && child.extension === "md") {
        files.push(child);
      } else if (child instanceof TFolder) {
        walk(child);
      }
    }
  };
  walk(folder);
  return files;
}

export function getSectionStats(
  app: App,
  meta: SectionMeta
): SectionStats {
  const folder = app.vault.getFolderByPath(meta.folder);
  if (!folder) {
    return {
      meta,
      fileCount: 0,
      latestFile: null,
      latestMtime: 0,
    };
  }

  const mdFiles = collectMarkdownFiles(folder);
  const latest = mdFiles.reduce<TFile | null>((best, file) => {
    if (!best || file.stat.mtime > best.stat.mtime) {
      return file;
    }
    return best;
  }, null);

  return {
    meta,
    fileCount: mdFiles.length,
    latestFile: latest,
    latestMtime: latest?.stat.mtime ?? 0,
  };
}

export function formatRelativeTime(mtimeMs: number): string {
  if (!mtimeMs) {
    return "暂无";
  }
  const diff = Date.now() - mtimeMs;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(mtimeMs).toLocaleDateString("zh-CN");
}
