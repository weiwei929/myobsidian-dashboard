import type { Moment } from "moment";
import type { App, TFile, TFolder } from "obsidian";

export interface DailyNotesPluginInstance {
  options: {
    folder: string;
    format: string;
    template: string;
  };
  createDailyNote: (date: Moment) => Promise<TFile | null>;
}

export interface FileExplorerInstance {
  revealInFolder: (folder: TFolder) => void;
}

export interface InternalPluginEntry<T = unknown> {
  enabled: boolean;
  instance: T;
}

export interface AppWithInternals extends App {
  internalPlugins: {
    plugins: Record<string, InternalPluginEntry>;
  };
}
