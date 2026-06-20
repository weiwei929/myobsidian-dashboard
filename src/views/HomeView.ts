import { TFile } from "obsidian";
import { formatDisplayPath } from "../navigation/labels";
import { getRecentMarkdownFiles } from "../vault/recent";
import { formatRelativeTime, getSectionStats, SectionStats } from "../vault/stats";
import type { SectionConfig } from "../config/settings";
import type { DashboardContext } from "./context";

export async function renderHomeView(
  ctx: DashboardContext,
  container: HTMLElement
): Promise<void> {
  const section = container.createDiv({ cls: "mod-sections" });
  section.createEl("h2", { text: "知识库总览" });

  const grid = section.createDiv({ cls: "mod-section-grid" });
  for (const meta of ctx.settings.sections) {
    if (meta.mode === "tool") {
      renderToolSectionCard(ctx, grid, meta);
    } else if (meta.mode === "reading") {
      const stats = getSectionStats(ctx.app, meta, ctx.settings);
      renderSectionCard(ctx, grid, stats);
    }
    // hidden sections are not rendered
  }

  renderRecent(ctx, container);
}

function renderSectionCard(
  ctx: DashboardContext,
  grid: HTMLElement,
  stats: SectionStats
): void {
  const card = grid.createDiv({ cls: "mod-section-card" });
  card.createEl("h3", { text: stats.meta.title });
  card.createEl("p", { cls: "mod-section-desc", text: stats.meta.description });

  const metaRow = card.createDiv({ cls: "mod-section-meta" });
  metaRow.createSpan({
    cls: "mod-section-count",
    text: `${stats.fileCount} 篇 Markdown`,
  });
  const latestText = stats.latestFile
    ? `最近：${stats.latestFile.basename}（${formatRelativeTime(stats.latestMtime)}）`
    : "最近：暂无";
  metaRow.createSpan({ cls: "mod-section-latest", text: latestText });

  card.addEventListener("click", () => {
    void ctx.navigate({ type: "folder", path: stats.meta.folder });
  });
}

function renderToolSectionCard(
  ctx: DashboardContext,
  grid: HTMLElement,
  meta: SectionConfig
): void {
  const card = grid.createDiv({ cls: "mod-section-card" });
  card.createEl("h3", { text: meta.title });
  card.createEl("p", { cls: "mod-section-desc", text: meta.description });

  const badge = card.createDiv({ cls: "mod-section-meta" });
  badge.createSpan({ cls: "mod-section-count", text: "工具 / 管理入口" });

  card.addEventListener("click", () => {
    void ctx.navigate({ type: "folder", path: meta.folder });
  });
}

function renderRecent(ctx: DashboardContext, container: HTMLElement): void {
  const section = container.createDiv({ cls: "mod-recent" });
  section.createEl("h2", { text: "最近修改" });

  const list = section.createDiv({ cls: "mod-recent-list" });
  const files = getRecentMarkdownFiles(ctx.app, ctx.settings);

  if (files.length === 0) {
    list.createEl("p", { cls: "mod-empty", text: "暂无 Markdown 文件" });
    return;
  }

  for (const file of files) {
    renderRecentItem(ctx, list, file);
  }
}

function renderRecentItem(
  ctx: DashboardContext,
  list: HTMLElement,
  file: TFile
): void {
  const item = list.createDiv({ cls: "mod-recent-item" });
  item.createSpan({ cls: "mod-recent-name", text: file.basename });
  const parentPath = file.parent?.path ?? "";
  item.createSpan({
    cls: "mod-recent-folder",
    text: parentPath ? formatDisplayPath(parentPath, ctx.settings.sections) : "",
  });
  item.createSpan({
    cls: "mod-recent-time",
    text: formatRelativeTime(file.stat.mtime),
  });

  item.addEventListener("click", () => {
    void ctx.navigate({ type: "document", path: file.path });
  });
}
