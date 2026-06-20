import { getSectionDescription, getSectionTitle } from "../navigation/labels";
import type { DashboardContext } from "./context";

export async function renderToolFolderView(
  ctx: DashboardContext,
  container: HTMLElement,
  folderPath: string
): Promise<void> {
  const root = folderPath.split("/")[0] ?? folderPath;

  const section = ctx.settings.sections.find((s) => s.folder === root);
  const header = container.createDiv({ cls: "mod-folder-header mod-tool-header" });
  header.createEl("h2", { text: getSectionTitle(folderPath, ctx.settings.sections) });
  header.createEl("p", { cls: "mod-folder-path", text: folderPath });
  header.createEl("span", { cls: "mod-tool-badge", text: "工具 / 管理入口" });

  const desc = getSectionDescription(folderPath, ctx.settings.sections);
  const hint =
    section?.description ?? "此区域不适合在 Dashboard 内深层浏览。";

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
  openBtn.addEventListener("click", () => {
    void ctx.revealInVault(folderPath);
  });
}
