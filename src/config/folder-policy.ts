/** 适读性分类：阅读前台 / 工具管理 / 隐藏 */
export type FolderMode = "reading" | "tool" | "hidden";

export const READING_ROOT_FOLDERS = new Set([
  "00-Home",
  "05-Inbox",
  "10-Journals",
  "12-DevLogs",
  "20-Clippings",
  "30-Knowledge",
  "40-Projects",
  "50-Resources",
  "60-Publishing",
]);

export const TOOL_ROOT_FOLDERS = new Set([
  "70-Templates",
  "80-Attachments",
  "90-Archive",
]);

export const HIDDEN_ROOT_FOLDERS = new Set(["00-Dashboard"]);

/** 路径中禁止导航的段（含面包屑、列表、最近修改） */
export const BLOCKED_PATH_SEGMENTS = new Set([
  "LegacyAttachments",
  "LegacyTemplates",
  "LegacyVault",
  "00-Dashboard",
  ".obsidian",
  ".trash",
  ".venv",
  "node_modules",
  "site-packages",
]);

export const INTRO_FILENAMES = new Set(["README.md", "INDEX.md", "index.md"]);

export const MAX_FOLDER_FILES = 50;

export function getRootFolder(vaultPath: string): string {
  return vaultPath.split("/")[0] ?? "";
}

export function isBlockedPath(vaultPath: string): boolean {
  if (!vaultPath) return true;
  const parts = vaultPath.split("/");
  return parts.some((part) => BLOCKED_PATH_SEGMENTS.has(part));
}

export function getFolderMode(folderPath: string): FolderMode {
  const root = getRootFolder(folderPath);
  if (HIDDEN_ROOT_FOLDERS.has(root) || isBlockedPath(folderPath)) {
    return "hidden";
  }
  if (TOOL_ROOT_FOLDERS.has(root)) {
    return "tool";
  }
  if (READING_ROOT_FOLDERS.has(root)) {
    return "reading";
  }
  return "hidden";
}

/** 文件或目录是否位于阅读前台区域 */
export function isReadablePath(vaultPath: string): boolean {
  if (!vaultPath || isBlockedPath(vaultPath)) {
    return false;
  }
  const root = getRootFolder(vaultPath);
  if (HIDDEN_ROOT_FOLDERS.has(root) || TOOL_ROOT_FOLDERS.has(root)) {
    return false;
  }
  return READING_ROOT_FOLDERS.has(root);
}

/** 是否允许 Dashboard 内进入该目录页 */
export function canNavigateToFolder(folderPath: string): boolean {
  if (!folderPath || isBlockedPath(folderPath)) {
    return false;
  }
  const mode = getFolderMode(folderPath);
  if (mode === "hidden") {
    return false;
  }
  if (mode === "tool") {
    return folderPath === getRootFolder(folderPath);
  }
  return mode === "reading";
}

/** 是否允许 Dashboard 内预览该文档 */
export function canNavigateToDocument(filePath: string): boolean {
  return isReadablePath(filePath);
}

export function isIntroFile(filename: string): boolean {
  return INTRO_FILENAMES.has(filename);
}

/** 检测损坏的 README/INDEX（治理期常见循环路径污染） */
export function isCorruptedIntroContent(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return true;

  // 过长的 H1 基本就是损坏
  const firstLine = trimmed.split("\n")[0] ?? "";
  if (firstLine.length > 120) return true;

  // Legacy 路径残留检查（正斜杠与反斜杠两种）
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

  // 重复编号路径模式如 70-70-70、80-80-80、90-90-90
  if (/\b\d{2,3}(-\d{2,3}){3,}/.test(firstLine)) return true;

  return false;
}
