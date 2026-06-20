import { App, TFile, moment } from "obsidian";
import type { DashboardSettings } from "../config/settings";
import { ensureTodayDailyNote } from "./resolver";

/**
 * 格式化今日要点 bullet：`- HH:mm 内容`
 */
export function formatHighlightBullet(content: string): string {
  const time = moment().format("HH:mm");
  const lines = content.trim().split("\n");
  const first = `- ${time} ${lines[0].trim()}`;
  if (lines.length === 1) return first;
  const rest = lines
    .slice(1)
    .map((l) => `  ${l.trim()}`)
    .join("\n");
  return `${first}\n${rest}`;
}

/**
 * 将一条 bullet 追加到 `## 今日要点` 小节。
 */
export function appendToTodayHighlights(
  fileContent: string,
  bullet: string,
  sectionHeader: string
): string {
  const lines = fileContent.split("\n");
  const sectionIndex = lines.findIndex(
    (line) => line.trim() === sectionHeader
  );

  if (sectionIndex !== -1) {
    let insertAt = sectionIndex + 1;
    for (let i = sectionIndex + 1; i < lines.length; i++) {
      if (lines[i].startsWith("## ")) {
        insertAt = i;
        break;
      }
      insertAt = i + 1;
    }
    lines.splice(insertAt, 0, bullet);
    return lines.join("\n");
  }

  const sectionBlock = `${sectionHeader}\n\n${bullet}\n`;
  return insertSectionNearTop(fileContent, sectionBlock);
}

function insertSectionNearTop(content: string, sectionBlock: string): string {
  if (content.startsWith("---")) {
    const closing = content.indexOf("\n---", 3);
    if (closing !== -1) {
      const afterFrontmatter = closing + 4;
      return (
        content.slice(0, afterFrontmatter) +
        "\n\n" +
        sectionBlock +
        content.slice(afterFrontmatter)
      );
    }
  }
  return sectionBlock + "\n" + content;
}

/** 写入今日要点并返回目标文件 */
export async function writeTodayHighlight(
  app: App,
  content: string,
  settings: DashboardSettings
): Promise<TFile> {
  const file = await ensureTodayDailyNote(app, settings);
  const bullet = formatHighlightBullet(content);
  const current = await app.vault.read(file);
  const updated = appendToTodayHighlights(
    current,
    bullet,
    settings.todayHighlightSection
  );
  if (updated !== current) {
    await app.vault.modify(file, updated);
  }
  return file;
}
