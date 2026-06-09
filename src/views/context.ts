import { App, Component } from "obsidian";
import type { DashboardRoute } from "../navigation/types";

export interface DashboardContext {
  app: App;
  component: Component;
  navigate: (route: DashboardRoute) => Promise<void>;
  revealInVault: (folderPath: string) => void;
}
