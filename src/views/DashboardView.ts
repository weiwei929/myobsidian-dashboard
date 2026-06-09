import { ItemView, WorkspaceLeaf, TFile, Notice } from "obsidian";
import type {
  AppWithInternals,
  FileExplorerInstance,
} from "../types/obsidian-internal";
import { SECTION_MAPPINGS } from "../config/sections";
import { ensureTodayDailyNote } from "../daily-note/resolver";
import { writeTodayHighlight } from "../daily-note/writer";
import { getRecentMarkdownFiles } from "../vault/recent";
import {
  formatRelativeTime,
  getSectionStats,
  SectionStats,
} from "../vault/stats";

export const VIEW_TYPE_DASHBOARD = "myobsidian-dashboard-view";

export class DashboardView extends ItemView {
  private highlightInput: HTMLInputElement | null = null;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_DASHBOARD;
  }

  getDisplayText(): string {
    return "MyObsidian Dashboard";
  }

  getIcon(): string {
    return "layout-dashboard";
  }

  async onOpen(): Promise<void> {
    await this.render();
  }

  async onClose(): Promise<void> {
    this.contentEl.empty();
  }

  async render(): Promise<void> {
    const root = this.contentEl;
    root.empty();
    root.addClass("myobsidian-dashboard");

    this.renderHeader(root);
    this.renderHighlightBar(root);
    await this.renderSections(root);
    this.renderRecent(root);
  }

  private renderHeader(container: HTMLElement): void {
    const header = container.createDiv({ cls: "mod-header" });
    header.createEl("h1", { text: "我的 Obsidian" });
    header.createEl("p", {
      cls: "mod-subtitle",
      text: "一个正在生长的个人知识库",
    });
  }

  private renderHighlightBar(container: HTMLElement): void {
    const bar = container.createDiv({ cls: "mod-highlight-bar" });

    const inputWrap = bar.createDiv({ cls: "mod-highlight-input-wrap" });
    this.highlightInput = inputWrap.createEl("input", {
      type: "text",
      placeholder: "今日要点 — 输入一句，回车保存",
      cls: "mod-highlight-input",
    });

    this.highlightInput.addEventListener("keydown", async (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      await this.handleHighlightSubmit();
    });

    const openBtn = bar.createEl("button", {
      cls: "mod-btn mod-btn-secondary",
      text: "打开今日日记",
    });
    openBtn.addEventListener("click", () => this.openTodayJournal());
  }

  private async handleHighlightSubmit(): Promise<void> {
    if (!this.highlightInput) return;
    const value = this.highlightInput.value.trim();
    if (!value) return;

    try {
      await writeTodayHighlight(this.app, value);
      this.highlightInput.value = "";
      new Notice("已写入今日要点");
      await this.render();
    } catch (error) {
      console.error("MyObsidian Dashboard: write highlight failed", error);
      new Notice("写入失败，请查看控制台");
    }
  }

  private async openTodayJournal(): Promise<void> {
    try {
      const file = await ensureTodayDailyNote(this.app);
      await this.app.workspace.getLeaf(true).openFile(file);
    } catch (error) {
      console.error("MyObsidian Dashboard: open journal failed", error);
      new Notice("无法打开今日日记");
    }
  }

  private async renderSections(container: HTMLElement): Promise<void> {
    const section = container.createDiv({ cls: "mod-sections" });
    section.createEl("h2", { text: "知识库板块" });

    const grid = section.createDiv({ cls: "mod-section-grid" });
    const statsList = SECTION_MAPPINGS.map((meta) =>
      getSectionStats(this.app, meta)
    );

    for (const stats of statsList) {
      this.renderSectionCard(grid, stats);
    }
  }

  private renderSectionCard(
    grid: HTMLElement,
    stats: SectionStats
  ): void {
    const card = grid.createDiv({ cls: "mod-section-card" });
    card.createEl("h3", { text: stats.meta.title });
    card.createEl("p", {
      cls: "mod-section-desc",
      text: stats.meta.description,
    });

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
      void this.openSection(stats.meta.folder);
    });
  }

  private renderRecent(container: HTMLElement): void {
    const section = container.createDiv({ cls: "mod-recent" });
    section.createEl("h2", { text: "最近修改" });

    const list = section.createDiv({ cls: "mod-recent-list" });
    const files = getRecentMarkdownFiles(this.app);

    if (files.length === 0) {
      list.createEl("p", { cls: "mod-empty", text: "暂无 Markdown 文件" });
      return;
    }

    for (const file of files) {
      this.renderRecentItem(list, file);
    }
  }

  private async openSection(folderPath: string): Promise<void> {
    const indexCandidates = [
      `${folderPath}/INDEX.md`,
      `${folderPath}/README.md`,
    ];
    for (const path of indexCandidates) {
      const file = this.app.vault.getFileByPath(path);
      if (file) {
        await this.app.workspace.getLeaf(true).openFile(file);
        return;
      }
    }

    const folder = this.app.vault.getFolderByPath(folderPath);
    const explorer = (this.app as unknown as AppWithInternals).internalPlugins
      .plugins["file-explorer"];
    if (folder && explorer?.enabled) {
      (explorer.instance as FileExplorerInstance).revealInFolder(folder);
      return;
    }

    new Notice(`未找到 ${folderPath} 的入口页`);
  }

  private renderRecentItem(list: HTMLElement, file: TFile): void {
    const item = list.createDiv({ cls: "mod-recent-item" });
    item.createSpan({ cls: "mod-recent-name", text: file.basename });
    const folder = file.parent?.path ?? "";
    item.createSpan({ cls: "mod-recent-folder", text: folder });
    item.createSpan({
      cls: "mod-recent-time",
      text: formatRelativeTime(file.stat.mtime),
    });

    item.addEventListener("click", () => {
      void this.app.workspace.getLeaf(true).openFile(file);
    });
  }
}
