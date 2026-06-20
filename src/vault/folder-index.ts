import { App, TFile } from "obsidian";
import { getFolderMode, isCorruptedIntroContent, isIntroFile } from "../config/folder-policy";
import type { DashboardSettings } from "../config/settings";

export interface FolderIntro {
  file: TFile;
  label: string;
}

const INTRO_PRIORITY = ["README.md", "INDEX.md", "index.md"];

export async function findFolderIntro(
  app: App,
  folderPath: string,
  settings: DashboardSettings
): Promise<FolderIntro | null> {
  if (getFolderMode(folderPath, settings) !== "reading") {
    return null;
  }

  for (const name of INTRO_PRIORITY) {
    const path = `${folderPath}/${name}`;
    const file = app.vault.getFileByPath(path);
    if (!file) continue;

    // 不在 introFilenames 里的跳过（用户可能删掉了默认值）
    if (!isIntroFile(name, settings.introFilenames)) continue;

    const content = await app.vault.read(file);
    if (isCorruptedIntroContent(content)) continue;

    const label = name === "README.md" ? "概览" : "目录说明";
    return { file, label };
  }

  return null;
}

export function isIntroPath(filePath: string, settings: DashboardSettings): boolean {
  const name = filePath.split("/").pop() ?? "";
  return isIntroFile(name, settings.introFilenames);
}
