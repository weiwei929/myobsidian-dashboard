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

## Vault 结构约定

本插件假定你的 Vault 使用编号前缀的根文件夹组织：

| 文件夹 | 板块 | 模式 |
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

三种访问模式：
- **reading** — 可浏览、可预览文档
- **tool** — 仅显示顶层入口，引导用户在 Vault 中打开
- **hidden** — 完全隐藏在仪表盘之外

文件夹内的 `README.md`、`INDEX.md` 或 `index.md` 会被自动识别为导读文件，在文件夹页顶部渲染。

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
