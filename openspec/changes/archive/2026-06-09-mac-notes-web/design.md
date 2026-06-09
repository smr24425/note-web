## Context

本專案為全新建立的 React Web 應用程式，目標是在瀏覽器中忠實還原 macOS Notes 的功能與視覺體驗。無現有程式碼基礎，完全在地端運行，資料儲存於瀏覽器 IndexedDB，不依賴任何後端服務。

## Goals / Non-Goals

**Goals:**
- 三欄式佈局（資料夾側邊欄 / 筆記列表 / 編輯區）完整實作
- 富文字編輯器支援 macOS Notes 的所有格式化功能
- 所有資料持久化於本地 IndexedDB
- 視覺風格忠實還原 macOS Notes（選中黃底、米白編輯區、系統字型）
- 深色 / 淺色主題切換
- 全文即時搜尋

**Non-Goals:**
- 雲端同步或多裝置同步
- 使用者帳號 / 登入系統
- 筆記分享或協作
- 行動裝置原生 App
- 離線 PWA（初版不做，未來可擴充）

## Decisions

### 1. 編輯器：Tiptap v2

**選擇**：Tiptap v2（基於 ProseMirror）

**理由**：
- 原生支援 Rich Text、核取清單（TaskList）、表格、圖片
- 可高度客製化擴充，方便實作 macOS Notes 特有行為（第一行大標題）
- 比 Quill 更現代，比 Slate 更穩定，比 Draft.js 更活躍維護
- 支援 JSON 序列化，便於存入 IndexedDB

**替代方案考慮**：
- Quill：擴充系統較舊，CSS 衝突多
- Slate：API 不穩定，升級成本高
- 純 contenteditable：維護成本極高

---

### 2. 本地儲存：Dexie.js（IndexedDB wrapper）

**選擇**：Dexie.js

**理由**：
- IndexedDB 可存大量結構化資料及 Blob（圖片），LocalStorage 5MB 上限不足
- Dexie.js 提供簡潔的 Promise/async API，避免原生 IndexedDB 繁瑣
- 支援 schema 版本管理（migration），未來擴充欄位時安全

**資料模型**：
```
notes
  id: string (uuid)
  folderId: string | null
  title: string           ← 第一行純文字
  contentJson: object     ← Tiptap JSON 格式
  contentText: string     ← 純文字，用於搜尋
  isPinned: boolean
  isDeleted: boolean
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date

folders
  id: string (uuid)
  name: string
  createdAt: Date
  updatedAt: Date
```

---

### 3. 狀態管理：Zustand

**選擇**：Zustand

**理由**：
- 輕量（< 1KB），適合此規模應用
- 無 boilerplate，比 Redux Toolkit 更簡潔
- 支援 selector 避免不必要重渲染
- 不需要 Context API 繞過 prop drilling

**Store 劃分**：
- `useNotesStore`：筆記列表、選中筆記、排序
- `useFoldersStore`：資料夾列表、選中資料夾
- `useSearchStore`：搜尋關鍵字、搜尋結果
- `useThemeStore`：主題設定

---

### 4. 樣式：Tailwind CSS + CSS Custom Properties

**選擇**：Tailwind CSS + CSS 變數做主題切換

**理由**：
- CSS 變數在 `:root` 與 `[data-theme="dark"]` 切換，最乾淨的深色模式方案
- Tailwind 處理 layout、spacing，CSS 變數管理品牌色
- macOS Notes 配色以 CSS 變數定義，方便精確還原

**核心配色變數**：
```css
/* 淺色 */
--color-sidebar-bg: #F2F2F2;
--color-list-bg:    #FAFAFA;
--color-selected:   #FFDE7D;   /* 招牌黃 */
--color-editor-bg:  #FFFEF2;   /* 米白 */
--color-text:       #1C1C1E;

/* 深色 */
--color-sidebar-bg: #1C1C1E;
--color-list-bg:    #2C2C2E;
--color-selected:   #3D3000;
--color-editor-bg:  #1C1C1E;
--color-text:       #F5F5F7;
```

---

### 5. 拖曳排序：dnd-kit

**選擇**：dnd-kit

**理由**：
- 支援鍵盤無障礙操作
- 比 react-beautiful-dnd 更輕量且仍在維護
- 用於資料夾列表排序與筆記拖曳至資料夾

---

### 6. 軟刪除與「最近刪除」

筆記刪除時設 `isDeleted: true`、`deletedAt: now()`，不立即從 IndexedDB 移除。  
「最近刪除」虛擬資料夾顯示所有 `isDeleted: true` 的筆記。  
每次應用程式啟動時，自動清除 `deletedAt` 超過 30 天的筆記（hard delete）。

## Risks / Trade-offs

| 風險 | 緩解方案 |
|------|----------|
| IndexedDB 被使用者清除（清除瀏覽器資料）→ 資料遺失 | 提供「匯出為 Markdown/JSON」功能（v2）|
| Tiptap JSON 格式版本升級 → 舊資料無法解析 | Dexie migration 做格式轉換，contentText 可回退為純文字顯示 |
| 大量筆記（1000+）搜尋效能 | contentText 欄位 + Dexie 全文索引，或前端 fuse.js 模糊搜尋 |
| 圖片佔用 IndexedDB 空間過大 | 初版限制貼上圖片大小（< 2MB），超過給出警告 |

## Open Questions

- 是否要在初版支援表格（Table）？Tiptap Table 擴充套件較複雜，可考慮 v2 加入。
- 鍵盤快捷鍵是否需要自訂（覆寫瀏覽器預設）？需考慮跨平台（Windows Ctrl vs Mac ⌘）。
