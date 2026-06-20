import { ItemView, WorkspaceLeaf, Notice } from "obsidian";
import { canNavigateToDocument, canNavigateToFolder } from "../config/folder-policy";
import type { DashboardSettings } from "../config/settings";
import { ensureTodayDailyNote } from "../daily-note/resolver";
import { writeTodayHighlight } from "../daily-note/writer";
import { buildBreadcrumbs } from "../navigation/breadcrumbs";
import type { DashboardRoute } from "../navigation/types";
import { renderDocumentView } from "./DocumentView";
import { renderFolderView } from "./FolderView";
import { renderHomeView } from "./HomeView";
import type { DashboardContext } from "./context";

export const VIEW_TYPE_DASHBOARD = "myobsidian-dashboard-view";

export class DashboardView extends ItemView {
  private settings: DashboardSettings;
  private route: DashboardRoute = { type: "home" };
  private shellTopEl: HTMLElement | null = null;
  private shellCrumbEl: HTMLElement | null = null;
  private shellBodyEl: HTMLElement | null = null;
  private highlightInput: HTMLTextAreaElement | null = null;
  private savedHighlights: Array<{ time: string; text: string }> = [];
  private savedHighlightsEl: HTMLElement | null = null;
  private shellReady = false;

  constructor(leaf: WorkspaceLeaf, settings: DashboardSettings) {
    super(leaf);
    this.settings = settings;
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

  /** 热更新 settings（供 setting tab 保存后调用） */
  updateSettings(settings: DashboardSettings): void {
    this.settings = settings;
  }

  async onOpen(): Promise<void> {
    this.ensureShell();
    await this.navigate({ type: "home" });
  }

  async onClose(): Promise<void> {
    this.contentEl.empty();
    this.shellReady = false;
    this.shellTopEl = null;
    this.shellCrumbEl = null;
    this.shellBodyEl = null;
    this.highlightInput = null;
    this.savedHighlights = [];
    this.savedHighlightsEl = null;
  }

  private getContext(): DashboardContext {
    return {
      app: this.app,
      component: this,
      settings: this.settings,
      navigate: (route) => this.navigate(route),
      revealInVault: (folderPath) => this.revealInVault(folderPath),
    };
  }

  async navigate(route: DashboardRoute): Promise<void> {
    if (route.type === "folder" && !canNavigateToFolder(route.path, this.settings)) {
      new Notice("无法导航到该目录");
      return;
    }
    if (route.type === "document" && !canNavigateToDocument(route.path, this.settings)) {
      new Notice("无法预览该文件");
      return;
    }

    this.route = route;
    this.ensureShell();
    this.renderBreadcrumbs();
    await this.renderBody();
  }

  private ensureShell(): void {
    if (this.shellReady) return;

    const root = this.contentEl;
    root.empty();
    root.addClass("myobsidian-dashboard");

    this.shellTopEl = root.createDiv({ cls: "mod-shell-top" });
    this.renderHeader(this.shellTopEl);
    this.renderHighlightBar(this.shellTopEl);

    this.shellCrumbEl = root.createDiv({ cls: "mod-shell-crumb" });
    this.shellBodyEl = root.createDiv({ cls: "mod-shell-body" });
    this.shellReady = true;
  }

  private renderHeader(container: HTMLElement): void {
    const header = container.createDiv({ cls: "mod-header" });
    const title = header.createEl("h1", { text: "我的 Obsidian" });
    title.addClass("mod-home-link");
    title.addEventListener("click", () => {
      void this.navigate({ type: "home" });
    });
    header.createEl("p", {
      cls: "mod-subtitle",
      text: "一个正在生长的个人知识库",
    });
  }

  private renderHighlightBar(container: HTMLElement): void {
    const bar = container.createDiv({ cls: "mod-highlight-bar" });

    this.savedHighlightsEl = bar.createDiv({ cls: "mod-saved-highlights" });
    this.renderSavedHighlights();

    const inputWrap = bar.createDiv({ cls: "mod-highlight-input-wrap" });
    this.highlightInput = inputWrap.createEl("textarea", {
      placeholder: "- 输入今日要点，Enter 保存，Shift+Enter 换行",
      cls: "mod-highlight-input",
    });
    this.highlightInput.rows = 1;

    this.highlightInput.addEventListener("keydown", async (event) => {
      if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        await this.handleHighlightSubmit();
      } else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        await this.handleHighlightSubmit();
      }
    });

    this.highlightInput.addEventListener("input", () => this.resizeHighlightInput());

    const openBtn = bar.createEl("button", {
      cls: "mod-btn mod-btn-secondary",
      text: "打开今日日记",
    });
    openBtn.addEventListener("click", () => this.openTodayJournal());

    const exitBtn = bar.createEl("button", {
      cls: "mod-btn mod-btn-ghost",
      text: "退出导航",
    });
    exitBtn.addEventListener("click", () => this.exitDashboard());
  }

  private renderSavedHighlights(): void {
    if (!this.savedHighlightsEl) return;
    this.savedHighlightsEl.empty();
    if (this.savedHighlights.length === 0) return;
    for (const item of this.savedHighlights) {
      const row = this.savedHighlightsEl.createDiv({ cls: "mod-saved-item" });
      row.createSpan({ cls: "mod-saved-time", text: item.time });
      row.createSpan({ cls: "mod-saved-text", text: item.text });
    }
  }

  private resizeHighlightInput(): void {
    const el = this.highlightInput;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  private async handleHighlightSubmit(): Promise<void> {
    if (!this.highlightInput) return;
    const value = this.highlightInput.value.trim();
    if (!value) return;

    try {
      await writeTodayHighlight(this.app, value, this.settings);
      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const firstLine = value.split("\n")[0]?.trim() ?? "";
      this.savedHighlights.unshift({ time: ts, text: firstLine });
      this.savedHighlights = this.savedHighlights.slice(0, 5);
      this.highlightInput.value = "";
      this.highlightInput.style.height = "auto";
      this.renderSavedHighlights();
      await this.renderBody();
    } catch (error) {
      console.error("MyObsidian Dashboard: write highlight failed", error);
      new Notice("写入失败，请查看控制台");
    }
  }

  private async openTodayJournal(): Promise<void> {
    try {
      const file = await ensureTodayDailyNote(this.app, this.settings);
      await this.app.workspace.getLeaf(true).openFile(file);
    } catch (error) {
      console.error("MyObsidian Dashboard: open journal failed", error);
      new Notice("无法打开今日日记");
    }
  }

  private renderBreadcrumbs(): void {
    if (!this.shellCrumbEl) return;
    this.shellCrumbEl.empty();

    if (this.route.type === "home") {
      this.shellCrumbEl.hide();
      return;
    }

    this.shellCrumbEl.show();
    const crumbs = buildBreadcrumbs(this.route, this.settings);
    const nav = this.shellCrumbEl.createDiv({ cls: "mod-breadcrumbs" });

    crumbs.forEach((crumb, index) => {
      if (index > 0) {
        nav.createSpan({ cls: "mod-breadcrumb-sep", text: " / " });
      }

      if (crumb.clickable && crumb.folderPath) {
        const link = nav.createSpan({ cls: "mod-breadcrumb-link", text: crumb.label });
        link.addEventListener("click", () => {
          void this.navigate({ type: "folder", path: crumb.folderPath! });
        });
      } else if (crumb.clickable && !crumb.folderPath) {
        const link = nav.createSpan({ cls: "mod-breadcrumb-link", text: crumb.label });
        link.addEventListener("click", () => {
          void this.navigate({ type: "home" });
        });
      } else {
        nav.createSpan({ cls: "mod-breadcrumb-current", text: crumb.label });
      }
    });
  }

  async renderBody(): Promise<void> {
    if (!this.shellBodyEl) return;
    this.shellBodyEl.empty();

    const ctx = this.getContext();

    switch (this.route.type) {
      case "home":
        await renderHomeView(ctx, this.shellBodyEl);
        break;
      case "folder":
        await renderFolderView(ctx, this.shellBodyEl, this.route.path);
        break;
      case "document":
        await renderDocumentView(ctx, this.shellBodyEl, this.route.path);
        break;
    }
  }

  /** 退出 Dashboard 前台，回到 Obsidian 新标签页 */
  private async exitDashboard(): Promise<void> {
    await this.leaf.setViewState({
      type: "empty",
      active: true,
    });
  }

  /** 保守打开 Vault 目录：尝试打开入口文件，失败时提示路径 */
  private async revealInVault(folderPath: string): Promise<void> {
    for (const name of this.settings.introFilenames) {
      const file = this.app.vault.getFileByPath(`${folderPath}/${name}`);
      if (file) {
        await this.app.workspace.getLeaf(true).openFile(file);
        return;
      }
    }
    new Notice(`请在 Obsidian 文件浏览器中定位：${folderPath}`);
  }
}
