import type { Moment } from "moment";

export interface DailyNotesPluginInstance {
  options: {
    folder: string;
    format: string;
    template: string;
  };
  createDailyNote: (date: Moment) => Promise<import("obsidian").TFile | null>;
}

export interface FileExplorerInstance {
  revealInFolder: (folder: import("obsidian").TFolder) => void;
}

export interface InternalPluginEntry<T = unknown> {
  enabled: boolean;
  instance: T;
}

export interface AppWithInternals extends import("obsidian").App {
  internalPlugins: {
    plugins: Record<string, InternalPluginEntry>;
  };
}
