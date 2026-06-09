export interface SectionMeta {
  folder: string;
  title: string;
  description: string;
}

/** v0.1 固定一级板块映射 */
export const SECTION_MAPPINGS: SectionMeta[] = [
  {
    folder: "00-Home",
    title: "首页与导航",
    description: "Vault 的入口、说明和总览页面",
  },
  {
    folder: "05-Inbox",
    title: "收件箱",
    description: "临时想法、待整理材料和未归档输入",
  },
  {
    folder: "10-Journals",
    title: "日常记录",
    description: "每日要点、长篇日记和生活/工作记录",
  },
  {
    folder: "12-DevLogs",
    title: "开发与 AI 工作日志",
    description: "AI 工具使用、开发过程、复盘与会话记录",
  },
  {
    folder: "20-Clippings",
    title: "外部摘录",
    description: "网页剪藏、外部材料和灵感来源",
  },
  {
    folder: "30-Knowledge",
    title: "知识沉淀",
    description: "已整理、可复用、可回看的知识内容",
  },
  {
    folder: "40-Projects",
    title: "项目空间",
    description: "项目卡、项目资料、任务拆解和阶段复盘",
  },
  {
    folder: "50-Resources",
    title: "资源库",
    description: "工具、素材、参考资料和长期资源",
  },
  {
    folder: "60-Publishing",
    title: "发布区",
    description: "面向输出、发布、整理成稿的内容",
  },
  {
    folder: "70-Templates",
    title: "模板库",
    description: "日记、项目、复盘、写作等模板",
  },
  {
    folder: "80-Attachments",
    title: "附件库",
    description: "图片、截图、媒体和文件附件",
  },
  {
    folder: "90-Archive",
    title: "归档",
    description: "已完成、暂停或历史资料",
  },
];
