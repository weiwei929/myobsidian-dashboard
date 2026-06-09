import { App, TFile, TFolder } from "obsidian";
import {
  BLOCKED_PATH_SEGMENTS,
  MAX_FOLDER_FILES,
  canNavigateToFolder,
  getFolderMode,
  isIntroFile,
} from "../config/folder-policy";

export interface FolderChildFolder {
  name: string;
  path: string;
  mode: ReturnType<typeof getFolderMode>;
}

export interface FolderContents {
  subfolders: FolderChildFolder[];
  files: TFile[];
}

function isNavigableSubfolder(parentPath: string, childName: string): boolean {
  if (BLOCKED_PATH_SEGMENTS.has(childName)) {
    return false;
  }
  const childPath = `${parentPath}/${childName}`;
  return canNavigateToFolder(childPath);
}

export function getFolderContents(app: App, folderPath: string): FolderContents {
  const folder = app.vault.getFolderByPath(folderPath);
  if (!folder) {
    return { subfolders: [], files: [] };
  }

  const mode = getFolderMode(folderPath);
  const subfolders: FolderChildFolder[] = [];
  const files: TFile[] = [];

  for (const child of folder.children) {
    if (child instanceof TFolder) {
      if (mode === "tool") continue;
      if (!isNavigableSubfolder(folderPath, child.name)) continue;
      subfolders.push({
        name: child.name,
        path: child.path,
        mode: getFolderMode(child.path),
      });
    } else if (child instanceof TFile && child.extension === "md") {
      if (isIntroFile(child.name)) continue;
      if (mode === "tool") continue;
      files.push(child);
    }
  }

  subfolders.sort((a, b) => a.name.localeCompare(b.name));
  files.sort((a, b) => b.stat.mtime - a.stat.mtime);

  return {
    subfolders,
    files: files.slice(0, MAX_FOLDER_FILES),
  };
}
