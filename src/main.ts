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
    const activeLeaf = workspace.activeLeaf;

    // 优先：当前 active leaf 是可替换页则直接替换
    if (activeLeaf && this.isReplaceableLeaf(activeLeaf)) {
      await activeLeaf.setViewState({
        type: VIEW_TYPE_DASHBOARD,
        active: true,
      });

      // 清理其他 Dashboard leaf，避免右侧旧实例残留
      for (const leaf of workspace.getLeavesOfType(VIEW_TYPE_DASHBOARD)) {
        if (leaf !== activeLeaf) {
          leaf.detach();
        }
      }

      workspace.revealLeaf(activeLeaf);
      return;
    }

    // 次优：已有 Dashboard leaf 则复用
    const existing = workspace.getLeavesOfType(VIEW_TYPE_DASHBOARD);
    if (existing.length > 0) {
      workspace.revealLeaf(existing[0]);
      return;
    }

    // 兜底：新开主工作区标签页
    const leaf = workspace.getLeaf(true);
    await leaf.setViewState({
      type: VIEW_TYPE_DASHBOARD,
      active: true,
    });
    workspace.revealLeaf(leaf);
  }

  /** 空白页 / 非 markdown 非 dashboard 的页面可替换；编辑 Markdown 时保守新开 */
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
