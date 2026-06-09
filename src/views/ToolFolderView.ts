import { getSectionDescription, getSectionTitle } from "../navigation/labels";
import type { DashboardContext } from "./context";

const TOOL_HINTS: Record<string, string> = {
  "70-Templates": "模板工具区，用于存放日记、项目、复盘等模板。日常阅读请使用其他板块。",
  "80-Attachments": "附件支撑区，存放图片、截图和媒体文件。不作为日常阅读主线。",
  "90-Archive": "冷归档区，存放已完成或暂停的历史资料。不作为日常浏览入口。",
};

export async function renderToolFolderView(
  ctx: DashboardContext,
  container: HTMLElement,
  folderPath: string
): Promise<void> {
  const root = folderPath.split("/")[0] ?? folderPath;

  const header = container.createDiv({ cls: "mod-folder-header mod-tool-header" });
  header.createEl("h2", { text: getSectionTitle(folderPath) });
  header.createEl("p", { cls: "mod-folder-path", text: folderPath });
  header.createEl("span", { cls: "mod-tool-badge", text: "工具 / 管理入口" });

  const desc = getSectionDescription(folderPath);
  const hint = TOOL_HINTS[root] ?? "此区域不适合在 Dashboard 内深层浏览。";

  const body = container.createDiv({ cls: "mod-tool-body" });
  if (desc) {
    body.createEl("p", { cls: "mod-tool-desc", text: desc });
  }
  body.createEl("p", { cls: "mod-tool-hint", text: hint });

  const actions = container.createDiv({ cls: "mod-folder-actions" });
  const openBtn = actions.createEl("button", {
    cls: "mod-btn",
    text: "在 Obsidian Vault 中打开",
  });
  openBtn.addEventListener("click", () => ctx.revealInVault(folderPath));
}
