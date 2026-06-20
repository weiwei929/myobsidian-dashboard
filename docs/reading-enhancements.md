# 阅读增强功能设计文档

> v0.2.x 计划 — 基于阅读优先原则，在不修改 Vault 原文的前提下，增强文档阅读、知识关联和检索能力。

## 设计原则

- **不修改原文**：所有用户输入（留言、收藏）存储于插件 `data.json`，绝不动 Vault 中的 `.md` 文件
- **只读优先**：基于 Obsidian 原生 API（`MetadataCache`、`Vault`）做只读查询，不引入写入路径
- **渐进增强**：新功能以可选面板/入口形式存在，不影响现有导航体验

---

## 功能一：阅读留言

### 目标

在文档预览页底部提供留言输入区，用户可对任意文档追加阅读感受、补充笔记。留言存储在插件自身数据中，不写入原文。

### 数据模型

```typescript
interface ReadingNote {
  /** 留言时间戳 */
  time: string;       // "2026-06-20 14:30"
  /** 留言内容 */
  text: string;
}

// 存储在 DashboardSettings 中
interface DashboardSettings {
  // ... 现有字段 ...
  readingNotes: Record<string, ReadingNote[]>;
  // key = filePath，value = 该文档的留言列表
}
```

### 交互流

1. 用户在文档预览页底部看到「阅读留言」区域
2. 已有留言以时间倒序列表展示（`time` + `text`）
3. 输入框：纯文本，Enter 提交，Shift+Enter 换行
4. 提交后即时更新 `settings.readingNotes[filePath]`，保存到 `data.json`
5. 留言仅在该文档的预览页可见

### 涉及文件

| 文件 | 变更 |
|---|---|
| `src/config/settings.ts` | `DashboardSettings` 新增 `readingNotes` 字段 |
| `src/views/DocumentView.ts` | 替换预留的 `mod-reading-notes-slot` 为完整留言 UI |
| `src/views/DashboardView.ts` | 传递 settings 已就绪，无需额外改动 |
| `src/main.ts` | 无需改动（`saveSettings` 已就绪） |

### UI 布局

```
┌─────────────────────────────────────┐
│  📄 文档预览内容 ...                 │
│  （内容已截断，完整阅读请点击打开原文）│
├─────────────────────────────────────┤
│  💬 阅读留言                         │
│  ┌─────────────────────────────────┐ │
│  │ 06-15 14:30 这篇文章让我联想到... │ │
│  │ 06-12 09:15 补充一个观点...      │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │ 输入新的阅读感受...              │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 功能二：文档关联面板

### 目标

在文档预览页展示当前文档的标签、出链（outgoing links）、反链（backlinks），形成阅读链路。全部基于 Obsidian `MetadataCache` 的只读 API。

### 数据来源

```typescript
// Obsidian 原生 API，零额外存储
const cache = app.metadataCache.getFileCache(file);
// cache.tags      → { tag: string }[]
// cache.links     → { link: string }[]
// cache.headings  → { heading: string }[]

const backlinks = app.metadataCache.getBacklinksForFile(file);
// → Record<string, Reference[]>  (反链文件路径 → 引用位置)
```

### 交互设计

预览页右侧或底部新增可折叠面板，包含三个区块：

**标签**
- 以标签云/badge 形式展示当前文档的所有标签
- 点击任意标签 → 进入标签过滤视图，列出 reading 区内所有带该标签的文件

**本文引用（出链）**
- 列出当前文档中所有的 `[[wiki-link]]` 或 `[text](url)` 内部链接
- 点击 → 跳转到目标文档的预览页

**被引用（反链）**
- 列出 Vault 中所有链接到当前文档的文件
- 标题显示反链数量，如「被 3 篇文档引用」
- 点击 → 跳转到反链源文档的预览页

### 涉及文件

| 文件 | 变更 |
|---|---|
| `src/views/DocumentView.ts` | 新增关联面板渲染函数 |
| `src/views/context.ts` | `DashboardContext` 无需改动（已有 `app`, `settings`） |
| `src/vault/` | 新增 `tags.ts` — 标签聚合与过滤工具函数 |
| `src/views/` | 新增 `TagView.ts` — 按标签过滤的文件列表视图，复用 FolderView 的列表渲染模式 |
| `src/navigation/types.ts` | 可选：`DashboardRoute` 新增 `{ type: "tag", tag: string }` |

### UI 布局

```
┌────────────────────────┬──────────────┐
│                        │ 📎 文档关联   │
│  文档预览（Markdown）   │              │
│                        │ 🏷 标签       │
│                        │ #方法论 #AI  │
│                        │              │
│                        │ 🔗 本文引用   │
│                        │ AI工作流     │
│                        │ 阅读笔记     │
│                        │              │
│                        │ 📥 被引用     │
│                        │ 项目复盘.md  │
│                        │ 知识地图.md  │
├────────────────────────┴──────────────┤
│  💬 阅读留言 ...                      │
└──────────────────────────────────────┘
```

### 注意事项

- 关联面板默认折叠，点击标题展开，避免干扰主阅读区
- 反链可能很多，按 mtime 排序并截断（如最多展示 20 条）
- 标签过滤视图复用 `FolderView` 的文件列表渲染模式，保持 UI 一致

---

## 功能三：搜索

### 目标

在仪表盘顶部或首页提供搜索入口，搜索范围限定为 reading 模式板块下的文件。

### 实现方案

```
用户输入 → 前端过滤 → 结果列表 → 点击预览
```

- 搜索源：`app.vault.getMarkdownFiles()` → 用 `isReadablePath` 过滤
- 匹配：文件名（`file.basename`）或路径，不读全文（保证性能）
- 实时过滤：输入时即时更新结果，无需按 Enter
- 结果列表：显示 `文件名` + `路径（中文展示）`，点击进入预览

可选进阶（后续迭代）：
- 全文搜索：调用 `app.vault.read(file)` 做内容匹配，建议加防抖
- 按标签搜索：`cache.tags.filter(t => t.tag.includes(query))`
- 搜索历史：存储最近 10 条搜索词

### 涉及文件

| 文件 | 变更 |
|---|---|
| `src/views/DashboardView.ts` | `shellTopEl` 中新增搜索栏 |
| `src/vault/` | 新增 `search.ts` — 搜索工具函数 |
| `src/views/` | 可选：新增 `SearchView.ts` — 搜索结果列表视图 |

---

## 实现顺序与依赖

```
功能一：阅读留言
  ├── 零新依赖，settings + DocumentView 即可
  └── 依赖：无

功能二：文档关联面板
  ├── 依赖 MetadataCache API（已可用）
  ├── 标签视图需要新 route 类型或嵌入现有视图
  └── 依赖：功能一会合入同一文件，建议功能一完成后再做

功能三：搜索
  ├── 依赖 isReadablePath + settings（已就绪）
  └── 依赖：无，可独立实现
```

**建议顺序**：留言 → 关联面板 → 搜索

原因：留言和关联面板都在文档预览页落地，一起做可以减少上下文切换；搜索最独立，放最后。

---

## 数据流总览

```
                    ┌──────────┐
                    │ data.json │
                    └──┬───┬───┘
                       │   │
              readingNotes  savedHighlights
                       │
                    ┌──▼──────┐
                    │ settings │
                    └──┬──────┘
                       │
            ┌──────────┼──────────┐
            ▼          ▼          ▼
       DocumentView  HomeView  FolderView
            │
    ┌───────┼───────┐
    ▼       ▼       ▼
  留言UI  关联面板  预览内容
            │
    ┌───────┴───────┐
    ▼               ▼
  MetadataCache    Vault API
  (标签/链接/反链)  (文件内容)
```

所有用户产生的数据（留言、设置）都走 `settings` → `data.json`；所有 Vault 数据（标签、链接、文件）都走 Obsidian 原生只读 API。
