/** v0.1 集中默认配置；发布前可改为设置页或外部配置 */
export const TODAY_HIGHLIGHT_SECTION = "## 今日要点";

/** Obsidian Daily Notes 未配置时的回退值（依据 Vault 迁移文档与目录结构） */
export const DEFAULT_DAILY_NOTES = {
  folder: "10-Journals",
  format: "YYYY/MM/YYYY-MM-DD",
  template: "10-Journals/Templates/journal-template-2026.md",
} as const;

/** 安装目标路径（仅用于 install 脚本，不进入业务逻辑） */
export const VAULT_PLUGIN_INSTALL_DIR =
  "D:/Obsidian-Vault/MyObsidian/.obsidian/plugins/myobsidian-dashboard";
