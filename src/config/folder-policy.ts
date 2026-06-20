import type { DashboardSettings } from "./settings";

/** 适读性分类：阅读前台 / 工具管理 / 隐藏 */
export type FolderMode = "reading" | "tool" | "hidden";

/** 路径中解析根文件夹 */
export function getRootFolder(vaultPath: string): string {
  return vaultPath.split("/")[0] ?? "";
}

/** 路径是否含被屏蔽的段（hidden 板块 或 屏蔽关键词） */
export function isBlockedPath(
  vaultPath: string,
  settings: DashboardSettings
): boolean {
  if (!vaultPath) return true;
  const parts = vaultPath.split("/");
  const hiddenFolders = new Set(
    settings.sections.filter((s) => s.mode === "hidden").map((s) => s.folder)
  );
  const blocked = new Set(settings.blockedPathSegments);
  return parts.some(
    (part) => hiddenFolders.has(part) || blocked.has(part)
  );
}

/** 从 sections 数组中查询文件夹的访问模式 */
export function getFolderMode(
  folderPath: string,
  settings: DashboardSettings
): FolderMode {
  const root = getRootFolder(folderPath);
  const section = settings.sections.find((s) => s.folder === root);
  if (!section) return "hidden";
  if (isBlockedPath(folderPath, settings)) return "hidden";
  return section.mode;
}

/** 文件或目录是否位于阅读前台区域 */
export function isReadablePath(
  vaultPath: string,
  settings: DashboardSettings
): boolean {
  if (!vaultPath) return false;
  return getFolderMode(vaultPath, settings) === "reading";
}

/** 是否允许 Dashboard 内进入该目录页 */
export function canNavigateToFolder(
  folderPath: string,
  settings: DashboardSettings
): boolean {
  if (!folderPath) return false;
  const mode = getFolderMode(folderPath, settings);
  if (mode === "hidden") return false;
  if (mode === "tool") {
    return folderPath === getRootFolder(folderPath);
  }
  return mode === "reading";
}

/** 是否允许 Dashboard 内预览该文档 */
export function canNavigateToDocument(
  filePath: string,
  settings: DashboardSettings
): boolean {
  return isReadablePath(filePath, settings);
}

export function isIntroFile(
  filename: string,
  introFilenames: ReadonlyArray<string>
): boolean {
  return introFilenames.includes(filename);
}

/** 检测损坏的 README/INDEX（治理期常见循环路径污染） */
export function isCorruptedIntroContent(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return true;

  const firstLine = trimmed.split("\n")[0] ?? "";
  if (firstLine.length > 120) return true;

  const legacyPatterns = [
    /LegacyTemplates/gi,
    /LegacyVault/gi,
    /LegacyAttachments/gi,
    /\\\\Legacy/,
  ];
  let totalHits = 0;
  for (const pat of legacyPatterns) {
    totalHits += (trimmed.match(pat) ?? []).length;
  }
  if (totalHits >= 3) return true;

  if (/\b\d{2,3}(-\d{2,3}){3,}/.test(firstLine)) return true;

  return false;
}
