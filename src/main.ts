import { Plugin } from "obsidian";
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
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_DASHBOARD)[0];

    if (!leaf) {
      const rightLeaf = workspace.getRightLeaf(false);
      leaf = rightLeaf ?? workspace.getLeaf(true);
      await leaf.setViewState({
        type: VIEW_TYPE_DASHBOARD,
        active: true,
      });
    }

    workspace.revealLeaf(leaf);
  }
}
