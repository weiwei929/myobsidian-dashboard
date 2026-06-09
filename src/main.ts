import { Plugin, WorkspaceLeaf } from "obsidian";
import { DashboardView, VIEW_TYPE_DASHBOARD } from "./views/DashboardView";

export default class MyObsidianDashboardPlugin extends Plugin {
  async onload(): Promise<void> {
    this.registerView(
      VIEW_TYPE_DASHBOARD,
      (leaf) => new DashboardView(leaf)
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
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_DASHBOARD);
  }

  async activateDashboard(): Promise<void> {
    const { workspace } = this.app;
    const existing = workspace.getLeavesOfType(VIEW_TYPE_DASHBOARD);

    if (existing.length > 0) {
      workspace.revealLeaf(existing[0]);
      return;
    }

    const activeLeaf = workspace.activeLeaf;
    const leaf =
      activeLeaf && this.isReplaceableLeaf(activeLeaf)
        ? activeLeaf
        : workspace.getLeaf(true);

    await leaf.setViewState({
      type: VIEW_TYPE_DASHBOARD,
      active: true,
    });
    workspace.revealLeaf(leaf);
  }

  /** 空白页可替换；正在编辑 Markdown 时保守新开标签页 */
  private isReplaceableLeaf(leaf: WorkspaceLeaf): boolean {
    const viewType = leaf.view.getViewType();
    if (viewType === "empty") {
      return true;
    }
    if (viewType === "markdown") {
      return false;
    }
    return viewType !== VIEW_TYPE_DASHBOARD;
  }
}
