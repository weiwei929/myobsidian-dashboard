import { App, TFile, TFolder } from "obsidian";
import { canNavigateToFolder, getFolderMode, isIntroFile } from "../config/folder-policy";
import type { DashboardSettings } from "../config/settings";

export interface FolderChildFolder {
  name: string;
  path: string;
  mode: ReturnType<typeof getFolderMode>;
}

export interface FolderContents {
  subfolders: FolderChildFolder[];
  files: TFile[];
}

function isNavigableSubfolder(
  parentPath: string,
  childName: string,
  settings: DashboardSettings
): boolean {
  const blocked = new Set(settings.blockedPathSegments);
  if (blocked.has(childName)) return false;
  const childPath = `${parentPath}/${childName}`;
  return canNavigateToFolder(childPath, settings);
}

export function getFolderContents(
  app: App,
  folderPath: string,
  settings: DashboardSettings
): FolderContents {
  const folder = app.vault.getFolderByPath(folderPath);
  if (!folder) {
    return { subfolders: [], files: [] };
  }

  const mode = getFolderMode(folderPath, settings);
  const subfolders: FolderChildFolder[] = [];
  const files: TFile[] = [];

  for (const child of folder.children) {
    if (child instanceof TFolder) {
      if (mode === "tool") continue;
      if (!isNavigableSubfolder(folderPath, child.name, settings)) continue;
      subfolders.push({
        name: child.name,
        path: child.path,
        mode: getFolderMode(child.path, settings),
      });
    } else if (child instanceof TFile && child.extension === "md") {
      if (isIntroFile(child.name, settings.introFilenames)) continue;
      if (mode === "tool") continue;
      files.push(child);
    }
  }

  subfolders.sort((a, b) => a.name.localeCompare(b.name));
  files.sort((a, b) => b.stat.mtime - a.stat.mtime);

  return {
    subfolders,
    files: files.slice(0, settings.maxFolderFiles),
  };
}
