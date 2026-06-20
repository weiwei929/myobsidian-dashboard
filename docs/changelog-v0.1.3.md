# v0.1.3 变更记录

> 日期：2026-06-20  
> 范围：从个人 Vault 硬编码插件 → 通用可配置插件

## 背景

v0.1.2 及之前版本的所有配置（板块列表、文件夹策略、路径屏蔽、每日笔记回退值）全部硬编码在源码中，与开发者个人 Vault 的文件夹命名体系强绑定。其他用户安装后无法使用，因为文件夹结构不同。

本次改造将硬编码配置全部抽离为插件设置页面，使插件成为真正的通用工具。

## 改动概览

```
30 files changed, 931 insertions(+), 529 deletions(-)
```

### 架构变更

```
Before (v0.1.2)                    After (v0.1.3)
───────────────                    ───────────────
SECTION_MAPPINGS (硬编码)    →     DashboardSettings.sections (可配置)
READING/TOOL/HIDDEN Sets     →     SectionConfig.mode (每板块一个mode)
BLOCKED_PATH_SEGMENTS        →     DashboardSettings.blockedPathSegments
INTRO_FILENAMES              →     DashboardSettings.introFilenames
DEFAULT_DAILY_NOTES          →     DashboardSettings.dailyNotes*
TODAY_HIGHLIGHT_SECTION      →     DashboardSettings.todayHighlightSection
MAX_FOLDER_FILES             →     DashboardSettings.maxFolderFiles
```

配置从分散的常量文件汇聚为单一的 `DashboardSettings` 接口，通过 `DashboardContext` 传递到所有视图和工具函数。

### 新增文件

| 文件 | 说明 |
|---|---|
| `src/config/settings.ts` | `DashboardSettings` 接口、`DEFAULT_SETTINGS` 默认值、`DashboardSettingTab` 设置标签页 |

### 删除文件

| 文件 | 原因 |
|---|---|
| `scripts/audit-journal-names.mjs` | 个人一次性审计脚本，不应发布 |
| `reports/journal-rename-candidates-2026-06-09.md` | 审计脚本的产物 |

### 修改文件（源码 22 个）

#### 配置层

| 文件 | 变更 |
|---|---|
| `src/config/defaults.ts` | 移除硬编码值，改为重导出 `settings.ts` 的类型 |
| `src/config/sections.ts` | 移除 `SECTION_MAPPINGS` 数组，`SectionMeta` 改为 `SectionConfig` 别名 |
| `src/config/folder-policy.ts` | 移除全部硬编码常量；所有函数接收 `DashboardSettings` 参数 |

#### Vault 层

| 文件 | 变更 |
|---|---|
| `src/vault/stats.ts` | `getSectionStats()` 接收 `settings`，`collectMarkdownFiles()` 使用配置的屏蔽列表 |
| `src/vault/recent.ts` | `getRecentMarkdownFiles()` 接收 `settings`，过滤逻辑使用 `isReadablePath` |
| `src/vault/folder-contents.ts` | `getFolderContents()` 接收 `settings`，使用配置的屏蔽/导读/maxfiles |
| `src/vault/folder-index.ts` | `findFolderIntro()` 接收 `settings`，使用配置的 introFilenames |

#### 导航层

| 文件 | 变更 |
|---|---|
| `src/navigation/labels.ts` | `getSectionTitle()` / `getSectionDescription()` / `formatDisplayPath()` 接收 `sections` 参数 |
| `src/navigation/breadcrumbs.ts` | `buildBreadcrumbs()` 接收 `settings`，policy 检查使用用户配置 |

#### 每日笔记层

| 文件 | 变更 |
|---|---|
| `src/daily-note/settings.ts` | `getDailyNotesSettings()` / `normalizeDailyNotesSettings()` 接收 `DashboardSettings` 作为回退源 |
| `src/daily-note/resolver.ts` | `resolveDailyNotePath()` / `getTodayDailyNote()` / `ensureTodayDailyNote()` 接收 `settings` |
| `src/daily-note/writer.ts` | `writeTodayHighlight()` 接收 `settings`，`appendToTodayHighlights()` 接收自定义标题 |

#### 视图层

| 文件 | 变更 |
|---|---|
| `src/views/context.ts` | `DashboardContext` 新增 `settings: DashboardSettings` |
| `src/views/DashboardView.ts` | 构造函数接收 `settings`，`getContext()` 携带 settings，新增 `updateSettings()` 方法 |
| `src/views/HomeView.ts` | 用 `ctx.settings.sections` 替代 `SECTION_MAPPINGS`，用 `section.mode` 替代 `TOOL_ROOT_FOLDERS` |
| `src/views/FolderView.ts` | policy 函数调用传入 `ctx.settings` |
| `src/views/DocumentView.ts` | `canNavigateToDocument` 传入 `ctx.settings`，路径显示传入 sections |
| `src/views/ToolFolderView.ts` | 用 `ctx.settings.sections` 替代硬编码的 TOOL_HINTS |

#### 入口与脚本

| 文件 | 变更 |
|---|---|
| `src/main.ts` | 新增 `settings` 属性、`loadSettings()` / `saveSettings()` / `rerenderActiveDashboard()`；注册 `DashboardSettingTab`；DashboardView 构造传入 settings |
| `scripts/install-to-vault.mjs` | 移除硬编码默认路径，环境变量改为必填 |
| `tsconfig.json` | 移除弃用的 `baseUrl`，`moduleResolution` 改为 `bundler` |
| `src/types/obsidian-internal.d.ts` | 修复 TS2499：用 named import 替代 extends 中的内联 import |
| `manifest.json` | 版本 `0.1.2` → `0.1.3` |
| `package.json` | 版本 `0.1.2` → `0.1.3` |

### 文档

| 文件 | 说明 |
|---|---|
| `README.md` | 新增 — 插件介绍、功能列表、Vault 配置说明、安装方式 |
| `LICENSE` | 新增 — MIT 许可证 |
| `docs/reading-enhancements.md` | 新增 — v0.2.x 阅读增强功能设计文档 |
| `docs/changelog-v0.1.3.md` | 本文件 |

## 默认值兼容

`DEFAULT_SETTINGS` 中的板块列表、屏蔽路径、导读文件名等默认值，与 v0.1.2 的硬编码值完全一致。现有用户升级后无需重新配置，行为保持不变。

## 用户设置界面

新增 `DashboardSettingTab`，位于 Obsidian 设置 → MyObsidian Dashboard，可配置：

- **板块配置**：增删改根文件夹板块，设置 reading/tool/hidden 模式
- **路径屏蔽**：自定义要隐藏的路径关键词
- **导读文件名**：自定义识别为导读的文件名
- **今日要点标题**：自定义每日笔记中的小节标题
- **每日笔记回退值**：文件夹、日期格式、模板路径
- **显示限制**：文件夹最大文件数

## 构建验证

```
$ npx tsc --noEmit    # 零错误
$ npm run build       # 构建成功
```

## 相关链接

- [项目仓库](https://github.com/weiwei929/myobsidian-dashboard)
- [v0.1.3 Release](https://github.com/weiwei929/myobsidian-dashboard/releases/tag/0.1.3)
- [阅读增强功能设计](reading-enhancements.md)
