import { TFile } from "obsidian";
import { getFolderMode } from "../config/folder-policy";
import { getSectionTitle, getSegmentLabel } from "../navigation/labels";
import { findFolderIntro } from "../vault/folder-index";
import { getFolderContents } from "../vault/folder-contents";
import { formatRelativeTime } from "../vault/stats";
import { renderFilePreview } from "../render/markdown";
import type { DashboardContext } from "./context";

export async function renderFolderView(
  ctx: DashboardContext,
  container: HTMLElement,
  folderPath: string
): Promise<void> {
  const mode = getFolderMode(folderPath);
  if (mode === "tool") {
    const { renderToolFolderView } = await import("./ToolFolderView");
    await renderToolFolderView(ctx, container, folderPath);
    return;
  }

  const header = container.createDiv({ cls: "mod-folder-header" });
  const displayTitle = folderPath.includes("/")
    ? getSegmentLabel(folderPath.split("/").pop() ?? folderPath)
    : getSectionTitle(folderPath);
  header.createEl("h2", { text: displayTitle });
  header.createEl("p", {
    cls: "mod-folder-path",
    text: folderPath,
  });

  const intro = await findFolderIntro(ctx.app, folderPath);
  if (intro) {
    const introSection = container.createDiv({ cls: "mod-folder-intro" });
    introSection.createEl("h3", { text: intro.label });
    const introBody = introSection.createDiv({ cls: "mod-folder-intro-body" });
    await renderFilePreview(ctx.app, ctx.component, introBody, intro.file);

    const introActions = introSection.createDiv({ cls: "mod-folder-actions" });
    const openIntroBtn = introActions.createEl("button", {
      cls: "mod-btn mod-btn-ghost",
      text: "打开原始说明文件",
    });
    openIntroBtn.addEventListener("click", () => {
      void ctx.app.workspace.getLeaf(true).openFile(intro.file);
    });
  }

  const actions = container.createDiv({ cls: "mod-folder-actions" });
  const backBtn = actions.createEl("button", {
    cls: "mod-btn mod-btn-secondary",
    text: "返回上级",
  });
  backBtn.addEventListener("click", () => {
    const segments = folderPath.split("/");
    if (segments.length <= 1) {
      void ctx.navigate({ type: "home" });
    } else {
      segments.pop();
      void ctx.navigate({ type: "folder", path: segments.join("/") });
    }
  });

  const { subfolders, files } = getFolderContents(ctx.app, folderPath);

  if (subfolders.length > 0) {
    const subSection = container.createDiv({ cls: "mod-subfolders" });
    subSection.createEl("h3", { text: "子目录" });
    const grid = subSection.createDiv({ cls: "mod-section-grid" });
    for (const sub of subfolders) {
      const card = grid.createDiv({ cls: "mod-section-card mod-subfolder-card" });
      card.createEl("h4", { text: getSegmentLabel(sub.name) });
      card.addEventListener("click", () => {
        void ctx.navigate({ type: "folder", path: sub.path });
      });
    }
  }

  if (files.length > 0) {
    const fileSection = container.createDiv({ cls: "mod-folder-files" });
    fileSection.createEl("h3", { text: "文档" });
    const list = fileSection.createDiv({ cls: "mod-recent-list" });
    for (const file of files) {
      renderFileRow(ctx, list, file);
    }
  }

  if (subfolders.length === 0 && files.length === 0 && !intro) {
    container.createEl("p", {
      cls: "mod-empty",
      text: "此目录下暂无可浏览内容",
    });
  }
}

function renderFileRow(
  ctx: DashboardContext,
  list: HTMLElement,
  file: TFile
): void {
  const item = list.createDiv({ cls: "mod-recent-item" });
  item.createSpan({ cls: "mod-recent-name", text: file.basename });
  item.createSpan({
    cls: "mod-recent-time",
    text: formatRelativeTime(file.stat.mtime),
  });
  item.addEventListener("click", () => {
    void ctx.navigate({ type: "document", path: file.path });
  });
}
