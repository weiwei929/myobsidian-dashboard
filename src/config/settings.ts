import { PluginSettingTab, Setting } from "obsidian";
import type MyObsidianDashboardPlugin from "../main";

/** 单个板块的配置 */
export interface SectionConfig {
  /** 根文件夹名，如 "10-Journals" */
  folder: string;
  /** 中文显示名，如 "日常记录" */
  title: string;
  /** 简要描述 */
  description: string;
  /** 访问模式 */
  mode: "reading" | "tool" | "hidden";
}

/** 插件全局设置 */
export interface DashboardSettings {
  sections: SectionConfig[];
  blockedPathSegments: string[];
  introFilenames: string[];
  todayHighlightSection: string;
  dailyNotesFolder: string;
  dailyNotesFormat: string;
  dailyNotesTemplate: string;
  maxFolderFiles: number;
}

export const DEFAULT_SETTINGS: DashboardSettings = {
  sections: [
    { folder: "00-Home", title: "首页与导航", description: "Vault 的入口、说明和总览页面", mode: "reading" },
    { folder: "05-Inbox", title: "收件箱", description: "临时想法、待整理材料和未归档输入", mode: "reading" },
    { folder: "10-Journals", title: "日常记录", description: "每日要点、长篇日记和生活/工作记录", mode: "reading" },
    { folder: "12-DevLogs", title: "开发与 AI 工作日志", description: "AI 工具使用、开发过程、复盘与会话记录", mode: "reading" },
    { folder: "20-Clippings", title: "外部摘录", description: "网页剪藏、外部材料和灵感来源", mode: "reading" },
    { folder: "30-Knowledge", title: "知识沉淀", description: "已整理、可复用、可回看的知识内容", mode: "reading" },
    { folder: "40-Projects", title: "项目空间", description: "项目卡、项目资料、任务拆解和阶段复盘", mode: "reading" },
    { folder: "50-Resources", title: "资源库", description: "工具、素材、参考资料和长期资源", mode: "reading" },
    { folder: "60-Publishing", title: "发布区", description: "面向输出、发布、整理成稿的内容", mode: "reading" },
    { folder: "70-Templates", title: "模板库", description: "日记、项目、复盘、写作等模板", mode: "tool" },
    { folder: "80-Attachments", title: "附件库", description: "图片、截图、媒体和文件附件", mode: "tool" },
    { folder: "90-Archive", title: "归档", description: "已完成、暂停或历史资料", mode: "tool" },
  ],
  blockedPathSegments: [
    ".obsidian",
    ".trash",
    ".venv",
    "node_modules",
    "site-packages",
  ],
  introFilenames: ["README.md", "INDEX.md", "index.md"],
  todayHighlightSection: "## 今日要点",
  dailyNotesFolder: "10-Journals",
  dailyNotesFormat: "YYYY/MM/YYYY-MM-DD",
  dailyNotesTemplate: "",
  maxFolderFiles: 50,
};

// ─── Setting Tab ───────────────────────────────────────────────

export class DashboardSettingTab extends PluginSettingTab {
  plugin: MyObsidianDashboardPlugin;
  private tempSections: SectionConfig[];

  constructor(plugin: MyObsidianDashboardPlugin) {
    super(plugin.app, plugin);
    this.plugin = plugin;
    this.tempSections = [...plugin.settings.sections];
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "MyObsidian Dashboard" });

    // ── Sections ──
    containerEl.createEl("h3", { text: "板块配置" });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "定义 Vault 中的根文件夹板块及其在仪表盘中的展示方式。",
    });

    for (let i = 0; i < this.tempSections.length; i++) {
      const section = this.tempSections[i];
      const group = containerEl.createDiv({ cls: "dashboard-setting-group" });

      new Setting(group)
        .setName("文件夹名")
        .setDesc("Vault 根目录下的文件夹名，如 10-Journals")
        .addText((text) =>
          text
            .setValue(section.folder)
            .onChange((value) => {
              section.folder = value;
            })
        );

      new Setting(group)
        .setName("显示标题")
        .setDesc("在首页卡片和面包屑中显示的名称")
        .addText((text) =>
          text
            .setValue(section.title)
            .onChange((value) => {
              section.title = value;
            })
        );

      new Setting(group)
        .setName("描述")
        .setDesc("首页卡片下方的简短说明")
        .addText((text) =>
          text
            .setValue(section.description)
            .onChange((value) => {
              section.description = value;
            })
        );

      new Setting(group)
        .setName("模式")
        .setDesc("reading = 可浏览预览 | tool = 仅显示入口 | hidden = 完全隐藏")
        .addDropdown((dropdown) =>
          dropdown
            .addOption("reading", "reading（阅读）")
            .addOption("tool", "tool（工具）")
            .addOption("hidden", "hidden（隐藏）")
            .setValue(section.mode)
            .onChange((value) => {
              section.mode = value as SectionConfig["mode"];
            })
        );

      new Setting(group)
        .addButton((btn) =>
          btn
            .setButtonText("移除")
            .setWarning()
            .onClick(() => {
              this.tempSections.splice(i, 1);
              this.display();
            })
        );
    }

    new Setting(containerEl)
      .addButton((btn) =>
        btn
          .setButtonText("添加板块")
          .setCta()
          .onClick(() => {
            this.tempSections.push({
              folder: "",
              title: "",
              description: "",
              mode: "reading",
            });
            this.display();
          })
      );

    // ── Blocked segments ──
    containerEl.createEl("h3", { text: "路径屏蔽" });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "包含以下任一关键词的路径将被隐藏，不出现在导航、面包屑和列表中。每行一个。",
    });

    const blockedArea = containerEl.createEl("textarea");
    blockedArea.value = this.plugin.settings.blockedPathSegments.join("\n");
    blockedArea.rows = 6;
    blockedArea.style.width = "100%";
    blockedArea.addEventListener("change", () => {
      this.plugin.settings.blockedPathSegments = blockedArea.value
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    });

    // ── Intro filenames ──
    containerEl.createEl("h3", { text: "导读文件名" });
    new Setting(containerEl)
      .setName("导读文件名")
      .setDesc("文件夹内匹配这些文件名的会被自动识别为导读。逗号分隔。")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.introFilenames.join(", "))
          .onChange((value) => {
            this.plugin.settings.introFilenames = value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          })
      );

    // ── Today highlight ──
    containerEl.createEl("h3", { text: "今日要点" });
    new Setting(containerEl)
      .setName("要点标题")
      .setDesc("每日笔记中用于存放要点的 Markdown 标题。")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.todayHighlightSection)
          .onChange((value) => {
            this.plugin.settings.todayHighlightSection = value;
          })
      );

    // ── Daily notes fallback ──
    containerEl.createEl("h3", { text: "每日笔记回退值" });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "当 Obsidian 的 Daily Notes 核心插件未启用或未配置时，使用以下值。",
    });

    new Setting(containerEl)
      .setName("文件夹")
      .setDesc("每日笔记存放的文件夹路径。")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.dailyNotesFolder)
          .onChange((value) => {
            this.plugin.settings.dailyNotesFolder = value;
          })
      );

    new Setting(containerEl)
      .setName("日期格式")
      .setDesc("Moment.js 日期格式字符串，如 YYYY/MM/YYYY-MM-DD。")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.dailyNotesFormat)
          .onChange((value) => {
            this.plugin.settings.dailyNotesFormat = value;
          })
      );

    new Setting(containerEl)
      .setName("模板路径")
      .setDesc("每日笔记的模板文件路径（可选）。")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.dailyNotesTemplate)
          .onChange((value) => {
            this.plugin.settings.dailyNotesTemplate = value;
          })
      );

    // ── Limits ──
    containerEl.createEl("h3", { text: "显示限制" });
    new Setting(containerEl)
      .setName("文件夹最大文件数")
      .setDesc("文件夹浏览时最多显示的文件数量。")
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings.maxFolderFiles))
          .onChange((value) => {
            const n = parseInt(value, 10);
            if (!isNaN(n) && n > 0) {
              this.plugin.settings.maxFolderFiles = n;
            }
          })
      );

    // ── Save ──
    containerEl.createEl("br");
    new Setting(containerEl)
      .addButton((btn) =>
        btn
          .setButtonText("保存并应用")
          .setCta()
          .onClick(async () => {
            this.plugin.settings.sections = [...this.tempSections];
            this.tempSections = [...this.plugin.settings.sections];
            await this.plugin.saveSettings();
            // Re-render the active dashboard if open
            this.plugin.rerenderActiveDashboard();
          })
      );
  }
}
