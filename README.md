# MyObsidian Dashboard

阅读优先的 Obsidian Vault 前台：博客式分层导航、今日要点与文档预览。

## 功能

- **分层导航** — 将 Vault 按板块（首页、收件箱、日常记录、知识沉淀、项目空间等）组织，逐层钻取文件夹和文件
- **今日要点** — 顶部输入栏，快捷记录当天要点，自动追加到每日笔记的「今日要点」区域
- **文档预览** — 在仪表盘内直接渲染 Markdown 文档，无需打开独立编辑器
- **工具区感知** — 模板库、附件库、归档等工具型分区显示简化视图，并提供「在 Vault 中打开」
- **面包屑导航** — 任意页面顶部显示中文路径面包屑，支持点击跳回
- **最近修改列表** — 首页展示最近修改的 Markdown 文件，快速回到工作现场
- **文件夹导读** — 自动查找并渲染文件夹内的 README.md / INDEX.md 作为导读说明
- **访问控制** — 系统路径（.obsidian、.trash 等）和隐藏版块自动过滤，不出现在导航中

## 使用方式

### 打开仪表盘

- 点击左侧 Ribbon 栏的仪表盘图标
- 或使用命令面板：`Ctrl/Cmd+P` → "打开 Vault 前台（仪表盘）"

### 导航操作

- **首页 → 板块**：点击任意板块卡片进入文件夹浏览
- **文件夹 → 文件**：点击文件即可在仪表盘内预览
- **面包屑**：点击路径中任意层级快速跳回
- **退出仪表盘**：点击导航栏的退出按钮，恢复普通视图

### 今日要点

- 在顶部输入栏直接输入内容
- **Enter** 保存并发送到每日笔记
- **Shift+Enter** 换行
- 最近 5 条已保存的要点显示在输入栏上方

### 每日笔记

- 点击「打开今日日记」按钮，自动创建或打开当天的每日笔记

## Vault 结构配置

插件不强制任何固定的文件夹命名。你可以在 **设置 → MyObsidian Dashboard → 板块配置** 中自由定义自己的板块。

每个板块有四种属性：

| 属性 | 说明 |
|---|---|
| **文件夹名** | Vault 根目录下的文件夹名，如 `日记`、`Projects`、`笔记` |
| **显示标题** | 在首页卡片和导航中显示的名称 |
| **描述** | 首页卡片下方的简短说明 |
| **模式** | reading / tool / hidden（见下） |

三个访问模式：

- **reading** — 完整浏览：首页展示板块卡片，可逐层钻取文件夹、预览文档
- **tool** — 仅入口：首页显示卡片，但文件夹内只展示简介和「在 Vault 中打开」按钮，不逐层列出内容。适合模板库、附件库等管理型文件夹
- **hidden** — 完全隐藏：不出现在首页、导航和最近修改列表中

### 默认配置

插件出厂时包含一套示例板块（编号前缀体系），**你可以全部删除或替换**为自己的文件夹结构：

<details>
<summary>点击展开默认板块列表</summary>

| 文件夹 | 标题 | 模式 |
|---|---|---|
| `00-Home` | 首页与导航 | reading |
| `05-Inbox` | 收件箱 | reading |
| `10-Journals` | 日常记录 | reading |
| `12-DevLogs` | 开发与 AI 工作日志 | reading |
| `20-Clippings` | 外部摘录 | reading |
| `30-Knowledge` | 知识沉淀 | reading |
| `40-Projects` | 项目空间 | reading |
| `50-Resources` | 资源库 | reading |
| `60-Publishing` | 发布区 | reading |
| `70-Templates` | 模板库 | tool |
| `80-Attachments` | 附件库 | tool |
| `90-Archive` | 归档 | tool |

</details>

### 导读文件

在 **设置 → MyObsidian Dashboard → 导读文件名** 中可配置哪些文件名被识别为文件夹导读（默认 `README.md, INDEX.md, index.md`），在文件夹页顶部渲染。

### 路径屏蔽

在 **设置 → MyObsidian Dashboard → 路径屏蔽** 中可配置需要隐藏的文件夹名（如 `.obsidian`、`node_modules`），包含这些关键词的路径将不出现在导航、面包屑和列表中。

## 安装

### 从 Obsidian 社区插件市场

1. 打开 Obsidian → 设置 → 第三方插件
2. 关闭安全模式
3. 点击「浏览」，搜索「MyObsidian Dashboard」
4. 安装并启用

### 手动安装

1. 从 [Releases](https://github.com/weiwei929/myobsidian-dashboard/releases) 下载最新版
2. 将 `main.js`、`manifest.json`、`styles.css` 解压到
   `<vault>/.obsidian/plugins/myobsidian-dashboard/`
3. 重启 Obsidian，在设置中启用插件

## 开发

```bash
# 安装依赖
npm install

# 开发模式（watch）
npm run dev

# 生产构建
npm run build
```

## 许可证

MIT © Pennphil Chan
