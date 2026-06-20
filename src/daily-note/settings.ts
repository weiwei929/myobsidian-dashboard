import { App } from "obsidian";
import type { DashboardSettings } from "../config/settings";
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

function getFallbackTemplate(settings: DashboardSettings): DailyNotesSettings {
  return {
    folder: settings.dailyNotesFolder,
    format: settings.dailyNotesFormat,
    template: settings.dailyNotesTemplate,
  };
}

/** 将空字符串 / 缺失值回退到 DashboardSettings 中的配置 */
export function normalizeDailyNotesSettings(
  raw: DailyNotesSettings | null,
  settings: DashboardSettings
): DailyNotesSettings {
  const fallback = getFallbackTemplate(settings);
  if (!raw) {
    return { ...fallback };
  }
  return {
    folder: isNonEmptyString(raw.folder) ? raw.folder.trim() : fallback.folder,
    format: isNonEmptyString(raw.format) ? raw.format.trim() : fallback.format,
    template: isNonEmptyString(raw.template)
      ? raw.template.trim()
      : fallback.template,
  };
}

/**
 * 基于 Obsidian Daily Notes 原始 options 判断是否可调用 createDailyNote()。
 */
export function hasUsableDailyNotesSettings(
  raw: DailyNotesSettings | null
): boolean {
  if (!raw) return false;
  const folder = raw.folder.trim();
  const format = raw.format.trim();
  if (!folder || !format) return false;
  if (!format.includes("YYYY")) return false;
  if (!format.includes("MM")) return false;
  if (!format.includes("DD")) return false;
  return true;
}

/** 归一化后的有效配置，用于 resolveDailyNotePath() */
export function getDailyNotesSettings(
  app: App,
  settings: DashboardSettings
): DailyNotesSettings {
  return normalizeDailyNotesSettings(getRawDailyNotesOptions(app), settings);
}
