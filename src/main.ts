import { Plugin, WorkspaceLeaf } from "obsidian";
import { DashboardView, VIEW_TYPE_DASHBOARD } from "./views/DashboardView";
import { DashboardSettings, DEFAULT_SETTINGS, DashboardSettingTab } from "./config/settings";

export default class MyObsidianDashboardPlugin extends Plugin {
  settings: DashboardSettings;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(
      VIEW_TYPE_DASHBOARD,
      (leaf) => new DashboardView(leaf, this.settings, () => this.saveSettings())
    );

    this.addRibbonIcon("layout-dashboard", "打开 MyObsidian Dashboard", () => {
      void this.activateDashboard();
    });

    this.addCommand({
      id: "open-dashboard",
      name: "打开 MyObsidian Dashboard",
      callback: () => {
        void this.activateDashboard();
      },
    });

    this.addSettingTab(new DashboardSettingTab(this));
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_DASHBOARD);
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  /** 刷新当前活跃的 Dashboard 视图以反映最新的设置 */
  rerenderActiveDashboard(): void {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_DASHBOARD)) {
      if (leaf.view instanceof DashboardView) {
        leaf.view.updateSettings(this.settings);
        void leaf.view.renderBody();
      }
    }
  }

  async activateDashboard(): Promise<void> {
    const { workspace } = this.app;
    const activeLeaf = workspace.activeLeaf;

    /** 将指定 leaf 替换为 Dashboard，并清理其他 Dashboard leaf */
    const replaceWithDashboard = async (leaf: WorkspaceLeaf) => {
      await leaf.setViewState({
        type: VIEW_TYPE_DASHBOARD,
        active: true,
      });
      for (const other of workspace.getLeavesOfType(VIEW_TYPE_DASHBOARD)) {
        if (other !== leaf) other.detach();
      }
      workspace.revealLeaf(leaf);
    };

    // 1. active leaf 是空页 → 直接替换
    if (activeLeaf?.view.getViewType() === "empty") {
      await replaceWithDashboard(activeLeaf);
      return;
    }

    // 2. 扫描主工作区所有 leaf，找第一个空页
    const emptyLeaf = workspace
      .getLeavesOfType("empty")
      .find((leaf) => leaf !== activeLeaf);
    if (emptyLeaf) {
      await replaceWithDashboard(emptyLeaf);
      return;
    }

    // 3. active leaf 是其他可替换页
    if (activeLeaf && this.isReplaceableLeaf(activeLeaf)) {
      await replaceWithDashboard(activeLeaf);
      return;
    }

    // 4. 已有 Dashboard leaf → 复用
    const existing = workspace.getLeavesOfType(VIEW_TYPE_DASHBOARD);
    if (existing.length > 0) {
      workspace.revealLeaf(existing[0]);
      return;
    }

    // 5. 兜底：新开标签页
    await replaceWithDashboard(workspace.getLeaf(true));
  }

  /** 非 markdown / 非 dashboard 的 leaf 可替换 */
  private isReplaceableLeaf(leaf: WorkspaceLeaf): boolean {
    const viewType = leaf.view.getViewType();
    if (viewType === "empty") return true;
    if (viewType === "markdown") return false;
    return viewType !== VIEW_TYPE_DASHBOARD;
  }
}
