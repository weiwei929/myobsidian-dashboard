import { TFile } from "obsidian";
import { canNavigateToDocument } from "../config/folder-policy";
import { formatDisplayPath } from "../navigation/labels";
import { renderFilePreview } from "../render/markdown";
import { formatRelativeTime } from "../vault/stats";
import type { DashboardContext } from "./context";

export async function renderDocumentView(
  ctx: DashboardContext,
  container: HTMLElement,
  filePath: string
): Promise<void> {
  if (!canNavigateToDocument(filePath)) {
    container.createEl("p", {
      cls: "mod-empty",
      text: "该文件不在阅读前台范围内，无法在 Dashboard 内预览。",
    });
    return;
  }

  const file = ctx.app.vault.getFileByPath(filePath);
  if (!file) {
    container.createEl("p", { cls: "mod-empty", text: "文件不存在或已被移动" });
    return;
  }

  const header = container.createDiv({ cls: "mod-doc-header" });
  header.createEl("h2", { text: file.basename.replace(/\.md$/i, "") });
  const navPath = file.parent?.path ? formatDisplayPath(file.parent.path) : "";
  if (navPath) {
    header.createEl("p", {
      cls: "mod-doc-meta",
      text: navPath,
    });
  }
  header.createEl("p", { cls: "mod-folder-path", text: file.path });
  header.createEl("p", {
    cls: "mod-doc-meta",
    text: `更新于 ${formatRelativeTime(file.stat.mtime)}`,
  });

  const actions = container.createDiv({ cls: "mod-folder-actions" });
  const openBtn = actions.createEl("button", {
    cls: "mod-btn",
    text: "打开原文",
  });
  openBtn.addEventListener("click", () => {
    void ctx.app.workspace.getLeaf(true).openFile(file);
  });

  const backBtn = actions.createEl("button", {
    cls: "mod-btn mod-btn-secondary",
    text: "返回目录",
  });
  backBtn.addEventListener("click", () => {
    const parent = file.parent?.path;
    if (parent) {
      void ctx.navigate({ type: "folder", path: parent });
    } else {
      void ctx.navigate({ type: "home" });
    }
  });

  const preview = container.createDiv({ cls: "mod-doc-preview" });
  const { truncated } = await renderFilePreview(
    ctx.app,
    ctx.component,
    preview,
    file
  );

  if (truncated) {
    const note = container.createEl("p", { cls: "mod-truncate-note" });
    note.setText("内容已截断，完整阅读请点击「打开原文」。");
  }

  // v0.1.2 预留：阅读留言输入区
  container.createDiv({ cls: "mod-reading-notes-slot" });
}
