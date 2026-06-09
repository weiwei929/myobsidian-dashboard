import { SECTION_MAPPINGS } from "../config/sections";

const TITLE_BY_FOLDER = new Map(
  SECTION_MAPPINGS.map((s) => [s.folder, s.title])
);

/** 一级目录中文阅读标题；未知则回退文件夹名 */
export function getSectionTitle(folderPath: string): string {
  const root = folderPath.split("/")[0] ?? folderPath;
  return TITLE_BY_FOLDER.get(root) ?? root;
}

export function getSectionDescription(folderPath: string): string | null {
  const root = folderPath.split("/")[0] ?? folderPath;
  const meta = SECTION_MAPPINGS.find((s) => s.folder === root);
  return meta?.description ?? null;
}
