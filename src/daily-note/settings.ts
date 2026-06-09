import { App } from "obsidian";
import { DEFAULT_DAILY_NOTES } from "../config/defaults";
import type {
  AppWithInternals,
  DailyNotesPluginInstance,
} from "../types/obsidian-internal";

export interface DailyNotesSettings {
  folder: string;
  format: string;
  template: string;
}

function getAppInternals(app: App): AppWithInternals {
  return app as unknown as AppWithInternals;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** 读取 Obsidian Daily Notes 原始 options，不做回退 */
export function getRawDailyNotesOptions(app: App): DailyNotesSettings | null {
  const internal = getAppInternals(app).internalPlugins.plugins["daily-notes"];
  if (!internal?.enabled) {
    return null;
  }
  const instance = internal.instance as DailyNotesPluginInstance;
  const opts = instance.options;
  return {
    folder: typeof opts.folder === "string" ? opts.folder : "",
    format: typeof opts.format === "string" ? opts.format : "",
    template: typeof opts.template === "string" ? opts.template : "",
  };
}

/** 将空字符串 / 缺失值回退到 DEFAULT_DAILY_NOTES，供路径解析使用 */
export function normalizeDailyNotesSettings(
  raw: DailyNotesSettings | null
): DailyNotesSettings {
  if (!raw) {
    return { ...DEFAULT_DAILY_NOTES };
  }
  return {
    folder: isNonEmptyString(raw.folder)
      ? raw.folder.trim()
      : DEFAULT_DAILY_NOTES.folder,
    format: isNonEmptyString(raw.format)
      ? raw.format.trim()
      : DEFAULT_DAILY_NOTES.format,
    template: isNonEmptyString(raw.template)
      ? raw.template.trim()
      : DEFAULT_DAILY_NOTES.template,
  };
}

/**
 * 基于 Obsidian Daily Notes 原始 options 判断是否可调用 createDailyNote()。
 * 不使用归一化后的 fallback 配置做此判断。
 */
export function hasUsableDailyNotesSettings(
  raw: DailyNotesSettings | null
): boolean {
  if (!raw) {
    return false;
  }
  const folder = raw.folder.trim();
  const format = raw.format.trim();
  if (!folder || !format) {
    return false;
  }
  if (!format.includes("YYYY")) {
    return false;
  }
  if (!format.includes("MM")) {
    return false;
  }
  if (!format.includes("DD")) {
    return false;
  }
  return true;
}

/** 归一化后的有效配置，用于 resolveDailyNotePath() */
export function getDailyNotesSettings(app: App): DailyNotesSettings {
  return normalizeDailyNotesSettings(getRawDailyNotesOptions(app));
}
