import { App, Component } from "obsidian";
import type { DashboardRoute } from "../navigation/types";
import type { DashboardSettings } from "../config/settings";

export interface DashboardContext {
  app: App;
  component: Component;
  settings: DashboardSettings;
  navigate: (route: DashboardRoute) => Promise<void>;
  revealInVault: (folderPath: string) => Promise<void>;
}
