import type { SectionConfig } from "../config/settings";

/** 二级及以下 segment 中文映射（只做显示层，不改 Vault 路径） */
const SEGMENT_LABELS: Record<string, string> = {
  Governance: "治理",
  Guides: "指南",
  Indexes: "索引",
  Maps: "知识地图",
  LegacyWorkspace: "旧工作区",
  QuickNotes: "快速笔记",
  AnnualReviews: "年度复盘",
  MonthlyReviews: "月度复盘",
  WeeklyReviews: "周度复盘",
  Templates: "模板",
  JournalTemplates: "日记模板",
  NoteTemplates: "笔记模板",
  ProjectTemplates: "项目模板",
  PublishingTemplates: "发布模板",
  LegacyTemplates: "旧模板",
  Assets: "素材",
  ByMonth: "按月份",
  Processed: "已处理",
  ToProcess: "待处理",
  Images: "图片",
  PDFs: "文档",
  Spreadsheets: "表格",
  Canvas: "画布",
  ClippingAssets: "剪藏素材",
  LegacyAttachments: "旧附件",
  LegacyVault: "旧库",
  Deprecated: "已废弃",
  RecoveryLogs: "恢复记录",
  AIToolPilotRecords: "AI 工具试水",
  CodexSessionLogs: "Codex 会话",
  ThinkLogs: "思考记录",
  AIWorkflow: "AI 工作流",
  DevOps: "运维",
  Methods: "方法论",
  NetworkProxy: "网络代理",
  PersonalGrowth: "个人成长",
  ReadingNotes: "阅读笔记",
  TechNotes: "技术笔记",
  WebPublishing: "网站发布",
  LegacyProjects: "旧项目",
  ProjectDocs: "项目文档",
  ProjectProgress: "项目进度",
  ProjectReviews: "项目复盘",
  WorkspaceProjects: "工作区项目",
  ResourceLedger: "资源台账",
  AI_Tools: "AI 工具",
  AI: "AI",
  Accounts: "账号",
  Domains: "域名",
  Finance: "财务",
  Network: "网络",
  Software: "软件",
  VPS: "VPS",
  BlogDrafts: "博客草稿",
  BlogGuides: "博客指南",
  BlogPublished: "已发布",
  ContentIdeas: "内容灵感",
  Sites: "站点",
  StaticSite: "静态站点",
  Apps: "应用",
  Products: "产品",
  LegacyTemplates_: "旧模板",
};

/** 一级目录中文阅读标题；未知则回退文件夹名 */
export function getSectionTitle(
  folderPath: string,
  sections: ReadonlyArray<SectionConfig>
): string {
  const root = folderPath.split("/")[0] ?? folderPath;
  const section = sections.find((s) => s.folder === root);
  return section?.title ?? root;
}

export function getSectionDescription(
  folderPath: string,
  sections: ReadonlyArray<SectionConfig>
): string | null {
  const root = folderPath.split("/")[0] ?? folderPath;
  const section = sections.find((s) => s.folder === root);
  return section?.description ?? null;
}

/** 单个 segment 的中文显示名；未命中保持原名 */
export function getSegmentLabel(segment: string): string {
  if (/^\d{4}$/.test(segment) || /^\d{2}$/.test(segment)) {
    return segment;
  }
  return SEGMENT_LABELS[segment] ?? segment;
}

/** 将 Vault 路径转换为中文阅读路径（一级用 sections 标题，后续用 segment 映射） */
export function formatDisplayPath(
  vaultPath: string,
  sections: ReadonlyArray<SectionConfig>
): string {
  const segments = vaultPath.split("/");
  return segments
    .map((seg, i) =>
      i === 0 ? getSectionTitle(seg, sections) : getSegmentLabel(seg)
    )
    .join(" / ");
}
