import { readdirSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join, relative } from "path";

const VAULT_ROOT = "D:/Obsidian-Vault/MyObsidian";
const JOURNALS_ROOT = join(VAULT_ROOT, "10-Journals");
const REPORT_PATH =
  "D:/workspace/experiments/myobsidian-dashboard/reports/journal-rename-candidates-2026-06-09.md";

const EXCLUDED_SEGMENTS = new Set([
  "Templates",
  "WeeklyReviews",
  "MonthlyReviews",
  "AnnualReviews",
]);

const STANDARD_DAILY_RE =
  /^10-Journals\/(\d{4})\/(\d{2})\/\1-\2-\d{2}\.md$/;

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

function toVaultRelative(fullPath) {
  return relative(VAULT_ROOT, fullPath).replace(/\\/g, "/");
}

function isUnderExcluded(relativePath) {
  const parts = relativePath.split("/").slice(1);
  return parts.some((p) => EXCLUDED_SEGMENTS.has(p));
}

function isIndexOrReadme(basename) {
  return basename === "INDEX.md" || basename === "README.md";
}

function isStandardDailyPath(relativePath) {
  return STANDARD_DAILY_RE.test(relativePath);
}

function inferDateFromBasename(basename) {
  const match = basename.match(DATE_IN_NAME_RE);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function suggestTarget(inferredDate) {
  if (!inferredDate) return null;
  const [y, m] = inferredDate.split("-");
  return `10-Journals/${y}/${m}/${inferredDate}.md`;
}

function classifyCandidate(relativePath, basename) {
  if (isUnderExcluded(relativePath)) {
    return { include: false, reason: "位于排除目录" };
  }
  if (isIndexOrReadme(basename)) {
    return { include: false, reason: "索引/说明页，非日记" };
  }
  if (isStandardDailyPath(relativePath)) {
    return { include: false, reason: "已符合标准路径" };
  }

  const inYearMonth = /^10-Journals\/\d{4}\/\d{2}\//.test(relativePath);
  const inferredDate = inferDateFromBasename(basename);

  if (inYearMonth) {
    return { include: true, inferredDate, reason: "年月目录下文件名非标准" };
  }
  if (inferredDate) {
    return { include: true, inferredDate, reason: "路径层级非标准但文件名含日期" };
  }
  return { include: false, reason: "非日记候选（无日期线索）" };
}

function riskNote(entry) {
  const notes = [];
  if (!entry.inferredDate) {
    notes.push("无法可靠推断日期");
  }
  if (entry.targetExists) {
    notes.push("目标路径已存在，改名会冲突");
  }
  if (entry.basename !== `${entry.inferredDate}.md` && entry.inferredDate) {
    notes.push("文件名含非标准后缀或字符");
  }
  return notes.length ? notes.join("；") : "低风险，可人工确认后迁移";
}

function shouldRename(entry) {
  if (!entry.inferredDate || !entry.suggestedTarget) return false;
  if (entry.targetExists) return false;
  if (entry.relativePath === entry.suggestedTarget) return false;
  return true;
}

function main() {
  const allFiles = walkMdFiles(JOURNALS_ROOT);
  const candidates = [];

  for (const full of allFiles) {
    const relativePath = toVaultRelative(full);
    const basename = full.split(/[/\\]/).pop();
    const classified = classifyCandidate(relativePath, basename);
    if (!classified.include) continue;

    const inferredDate = classified.inferredDate ?? null;
    const suggestedTarget = suggestTarget(inferredDate);
    const targetExists = suggestedTarget
      ? existsSync(join(VAULT_ROOT, suggestedTarget))
      : false;

    const entry = {
      relativePath,
      basename,
      inferredDate,
      suggestedTarget,
      targetExists,
      classifyReason: classified.reason,
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
    "排除文件：`INDEX.md`、`README.md`（索引/说明页）",
    "",
    "状态：**只读审计，未执行任何改名**",
    "",
    `共发现 **${candidates.length}** 个日记命名候选（已过滤标准日记与索引页）。`,
    "",
    "## 汇总",
    "",
    `- 建议改名：${candidates.filter((c) => c.recommend).length} 个`,
    `- 存在目标冲突：${candidates.filter((c) => c.targetExists).length} 个`,
    `- 无法推断日期：${candidates.filter((c) => !c.inferredDate).length} 个`,
    "",
    "## 候选明细",
    "",
    "| 当前路径 | 推断日期 | 建议目标路径 | 目标已存在 | 建议改名 | 分类 | 风险说明 |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  ];

  for (const c of candidates) {
    lines.push(
      `| \`${c.relativePath}\` | ${c.inferredDate ?? "—"} | ${c.suggestedTarget ? `\`${c.suggestedTarget}\`` : "—"} | ${c.targetExists ? "是" : "否"} | ${c.recommend ? "是" : "否"} | ${c.classifyReason} | ${c.risk} |`
    );
  }

  lines.push("");
  lines.push("## 说明");
  lines.push("");
  lines.push("- 本清单仅基于路径与文件名模式推断，未读取文件正文。");
  lines.push("- 已符合 `10-Journals/YYYY/MM/YYYY-MM-DD.md` 的日记**不列入**本表。");
  lines.push("- 执行改名前须人工确认；冲突文件必须跳过，不得覆盖。");

  mkdirSync(join(REPORT_PATH, ".."), { recursive: true });
  writeFileSync(REPORT_PATH, lines.join("\n"), "utf8");
  console.log(`Wrote ${candidates.length} candidates to ${REPORT_PATH}`);
}

main();
