import { App, TFile } from "obsidian";
import {
  getFolderMode,
  isCorruptedIntroContent,
  isIntroFile,
} from "../config/folder-policy";

export interface FolderIntro {
  file: TFile;
  label: string;
}

const INTRO_PRIORITY = ["README.md", "INDEX.md", "index.md"];

export async function findFolderIntro(
  app: App,
  folderPath: string
): Promise<FolderIntro | null> {
  if (getFolderMode(folderPath) !== "reading") {
    return null;
  }

  for (const name of INTRO_PRIORITY) {
    const path = `${folderPath}/${name}`;
    const file = app.vault.getFileByPath(path);
    if (!file) continue;

    const content = await app.vault.read(file);
    if (isCorruptedIntroContent(content)) continue;

    const label = name === "README.md" ? "概览" : "目录说明";
    return { file, label };
  }

  return null;
}

export function isIntroPath(filePath: string): boolean {
  const name = filePath.split("/").pop() ?? "";
  return isIntroFile(name);
}
