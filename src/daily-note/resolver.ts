import { App, TFile, moment } from "obsidian";
import type { Moment } from "moment";
import {
  getDailyNotesSettings,
  getRawDailyNotesOptions,
  hasUsableDailyNotesSettings,
} from "./settings";
import type {
  AppWithInternals,
  DailyNotesPluginInstance,
} from "../types/obsidian-internal";

function getAppInternals(app: App): AppWithInternals {
  return app as unknown as AppWithInternals;
}

/** 根据配置计算指定日期的日记相对路径 */
export function resolveDailyNotePath(
  app: App,
  date: Moment = moment()
): string {
  const { folder, format } = getDailyNotesSettings(app);
  const filename = date.format(format);
  if (!folder) {
    return `${filename}.md`;
  }
  return `${folder}/${filename}.md`;
}

/** 获取当天日记文件，不存在则返回 null */
export function getTodayDailyNote(app: App): TFile | null {
  const path = resolveDailyNotePath(app);
  const file = app.vault.getFileByPath(path);
  return file ?? null;
}

/** 通过 Daily Notes 插件或插件自有逻辑创建当天日记 */
export async function ensureTodayDailyNote(app: App): Promise<TFile> {
  const existing = getTodayDailyNote(app);
  if (existing) {
    return existing;
  }

  const raw = getRawDailyNotesOptions(app);
  if (hasUsableDailyNotesSettings(raw)) {
    const internal = getAppInternals(app).internalPlugins.plugins["daily-notes"];
    if (internal?.enabled) {
      const instance = internal.instance as DailyNotesPluginInstance;
      const created = await instance.createDailyNote(moment());
      if (created) {
        return created;
      }
    }
  }

  const path = resolveDailyNotePath(app);
  await ensureParentFolders(app, path);
  const today = moment().format("YYYY-MM-DD");
  const minimal = [
    "---",
    `created: ${moment().format("YYYY-MM-DD HH:mm")}`,
    "tags: [日记]",
    "---",
    "",
    `# ${today}`,
    "",
    "## 今日要点",
    "",
  ].join("\n");

  return app.vault.create(path, minimal);
}

async function ensureParentFolders(app: App, filePath: string): Promise<void> {
  const parts = filePath.split("/");
  parts.pop();
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!app.vault.getFolderByPath(current)) {
      await app.vault.createFolder(current);
    }
  }
}
