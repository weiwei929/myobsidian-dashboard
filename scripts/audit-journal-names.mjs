import { readdirSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join, relative } from "path";

const JOURNALS_ROOT = "D:/Obsidian-Vault/MyObsidian/10-Journals";
const REPORT_PATH =
  "D:/workspace/experiments/myobsidian-dashboard/reports/journal-rename-candidates-2026-06-09.md";

const EXCLUDED_SEGMENTS = new Set([
  "Templates",
  "WeeklyReviews",
  "MonthlyReviews",
  "AnnualReviews",
]);

const STANDARD_PATH_RE =
  /^10-Journals\/\d{4}\/\d{2}\/\d{4}-\d{2}-\d{2}\.md$/;

const DATE_IN_NAME_RE = /(\d{4})-(\d{2})-(\d{2})/;

function walkMdFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkMdFiles(full, files);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(full);
    }
  }
  return files;
}

function isExcluded(relativePath) {
  const parts = relativePath.split("/").slice(1);
  return parts.some((p) => EXCLUDED_SEGMENTS.has(p));
}

function inferDate(basename, relativePath) {
  const fromName = basename.match(DATE_IN_NAME_RE);
  if (fromName) {
    return `${fromName[1]}-${fromName[2]}-${fromName[3]}`;
  }
  const fromPath = relativePath.match(
    /10-Journals\/(\d{4})\/(\d{2})\//
  );
  if (fromPath) {
    return null;
  }
  return null;
}

function suggestTarget(inferredDate) {
  if (!inferredDate) return null;
  const [y, m] = inferredDate.split("-");
  return `10-Journals/${y}/${m}/${inferredDate}.md`;
}

function riskNote(entry) {
  const notes = [];
  if (!entry.inferredDate) {
    notes.push("无法从文件名或路径可靠推断日期");
  }
  if (entry.targetExists) {
    notes.push("目标路径已存在，改名会冲突");
  }
  if (entry.basename !== `${entry.inferredDate}.md` && entry.inferredDate) {
    notes.push("文件名含非标准后缀或字符");
  }
  if (isExcluded(entry.relativePath)) {
    notes.push("位于排除目录（不应改名）");
  }
  return notes.length ? notes.join("；") : "低风险，可人工确认后迁移";
}

function shouldRename(entry) {
  if (entry.isStandard) return false;
  if (isExcluded(entry.relativePath)) return false;
  if (!entry.suggestedTarget) return false;
  if (entry.targetExists) return false;
  return true;
}

function main() {
  const allFiles = walkMdFiles(JOURNALS_ROOT);
  const candidates = [];

  for (const full of allFiles) {
    const relativePath = relative(
      "D:/Obsidian-Vault/MyObsidian",
      full
    ).replace(/\\/g, "/");
    const basename = full.split(/[/\\]/).pop();
    const isStandard = STANDARD_PATH_RE.test(relativePath);
    if (isStandard) continue;

    const inferredDate = inferDate(basename, relativePath);
    const suggestedTarget = suggestTarget(inferredDate);
    const targetExists = suggestedTarget
      ? existsSync(
          join("D:/Obsidian-Vault/MyObsidian", suggestedTarget)
        )
      : false;

    const entry = {
      relativePath,
      basename,
      inferredDate,
      suggestedTarget,
      targetExists,
      isStandard,
    };

    candidates.push({
      ...entry,
      recommend: shouldRename(entry),
      risk: riskNote(entry),
    });
  }

  candidates.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  const lines = [
    "# 10-Journals 日记命名候选清单",
    "",
    "日期：2026-06-09",
    "",
    "扫描范围：`D:\\Obsidian-Vault\\MyObsidian\\10-Journals`",
    "",
    "标准路径：`10-Journals/YYYY/MM/YYYY-MM-DD.md`",
    "",
    "排除目录：`Templates`、`WeeklyReviews`、`MonthlyReviews`、`AnnualReviews`",
    "",
    "状态：**只读审计，未执行任何改名**",
    "",
    `共发现 **${candidates.length}** 个非标准路径 Markdown 文件。`,
    "",
    "## 汇总",
    "",
    `- 建议改名：${candidates.filter((c) => c.recommend).length} 个`,
    `- 存在目标冲突：${candidates.filter((c) => c.targetExists).length} 个`,
    `- 无法推断日期：${candidates.filter((c) => !c.inferredDate).length} 个`,
    "",
    "## 候选明细",
    "",
    "| 当前路径 | 推断日期 | 建议目标路径 | 目标已存在 | 建议改名 | 风险说明 |",
    "| --- | --- | --- | --- | --- | --- |",
  ];

  for (const c of candidates) {
    lines.push(
      `| \`${c.relativePath}\` | ${c.inferredDate ?? "—"} | ${c.suggestedTarget ? `\`${c.suggestedTarget}\`` : "—"} | ${c.targetExists ? "是" : "否"} | ${c.recommend ? "是" : "否"} | ${c.risk} |`
    );
  }

  lines.push("");
  lines.push("## 说明");
  lines.push("");
  lines.push("- 本清单仅基于路径与文件名模式推断，未读取文件正文。");
  lines.push("- `INDEX.md`、`README.md` 等索引页列入非标准路径，但通常不应改名。");
  lines.push("- 执行改名前须人工确认；冲突文件必须跳过，不得覆盖。");

  mkdirSync(join(REPORT_PATH, ".."), { recursive: true });
  writeFileSync(REPORT_PATH, lines.join("\n"), "utf8");
  console.log(`Wrote ${candidates.length} candidates to ${REPORT_PATH}`);
}

main();
