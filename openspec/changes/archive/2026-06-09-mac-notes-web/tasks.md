## 1. 專案初始化

- [x] 1.1 使用 Vite 建立 React + TypeScript 專案（`npm create vite@latest`）
- [x] 1.2 安裝核心依賴：Tiptap v2 及擴充套件、Dexie.js、Zustand、Tailwind CSS、dnd-kit
- [x] 1.3 設定 Tailwind CSS（tailwind.config.js、postcss.config.js）
- [x] 1.4 定義 CSS Custom Properties（淺色/深色主題配色變數）
- [x] 1.5 建立專案目錄結構（components、stores、db、hooks、types）

## 2. 資料層（note-storage）

- [x] 2.1 定義 TypeScript 型別：`Note`、`Folder` interface
- [x] 2.2 使用 Dexie.js 定義 IndexedDB Schema（notes、folders 資料表，含索引）
- [x] 2.3 實作 `notesDb.ts`：筆記 CRUD 操作（create、read、update、softDelete、hardDelete）
- [x] 2.4 實作 `foldersDb.ts`：資料夾 CRUD 操作
- [x] 2.5 實作啟動時自動清除 30 天以上的軟刪除筆記邏輯

## 3. 狀態管理

- [x] 3.1 實作 `useNotesStore`（Zustand）：筆記列表、選中筆記、排序方式
- [x] 3.2 實作 `useFoldersStore`（Zustand）：資料夾列表、選中資料夾
- [x] 3.3 實作 `useSearchStore`（Zustand）：搜尋關鍵字、搜尋結果
- [x] 3.4 實作 `useThemeStore`（Zustand）：主題設定（含 localStorage 持久化）

## 4. 主題系統（app-theme）

- [x] 4.1 實作主題切換邏輯（在 `<html>` 或 `<body>` 切換 `data-theme` 屬性）
- [x] 4.2 實作跟隨系統主題（`prefers-color-scheme` media query）
- [x] 4.3 實作手動覆蓋邏輯（localStorage 儲存使用者偏好）
- [x] 4.4 確認所有配色變數在兩種主題下皆正確套用

## 5. 三欄式主版面

- [x] 5.1 建立 `AppLayout` 元件（三欄 flex 佈局，固定寬度分配）
- [ ] 5.2 實作欄位寬度調整（可拖曳分隔線，選填）
- [x] 5.3 確認整體佈局在 1280px 以上視窗正確顯示

## 6. 資料夾側邊欄（folder-management）

- [x] 6.1 建立 `Sidebar` 元件，顯示虛擬資料夾（所有備忘錄、最近刪除）
- [x] 6.2 顯示自訂資料夾列表，選中資料夾以高亮標示
- [x] 6.3 實作「新增資料夾」按鈕與 inline 編輯輸入框
- [x] 6.4 實作資料夾雙擊重新命名功能
- [x] 6.5 實作資料夾右鍵選單（重新命名、刪除）
- [x] 6.6 實作刪除含筆記資料夾的確認對話框

## 7. 筆記列表（note-list）

- [x] 7.1 建立 `NoteList` 元件，依當前選中資料夾篩選並渲染筆記卡片
- [x] 7.2 建立 `NoteCard` 元件（標題、時間戳記格式化、正文預覽）
- [x] 7.3 實作選中筆記黃色高亮（`--color-selected`）
- [x] 7.4 實作置頂筆記邏輯（置頂筆記排最前，顯示釘選圖示）
- [x] 7.5 實作筆記列表排序（依修改時間、建立時間、標題）
- [x] 7.6 實作「+」新增筆記按鈕（Ctrl/⌘+N 快捷鍵）
- [x] 7.7 實作筆記右鍵選單（置頂、移至資料夾、刪除）
- [x] 7.8 實作刪除後自動選中相鄰筆記邏輯

## 8. 富文字編輯器（note-editor）

- [x] 8.1 整合 Tiptap，設定基本擴充套件（Document、Paragraph、Text、History）
- [x] 8.2 實作第一行大標題樣式（Heading level 1 for first line）
- [x] 8.3 新增文字格式擴充：Bold、Italic、Underline、Strike
- [x] 8.4 新增列表擴充：BulletList、OrderedList、TaskList（核取清單）
- [x] 8.5 新增連結擴充（Link）：自動偵測 URL + 手動插入
- [x] 8.6 新增圖片擴充（Image）：支援貼上（paste handler）與拖曳（drop handler）
- [x] 8.7 實作 2MB 圖片大小限制，超過時顯示警告 toast
- [x] 8.8 建立 `EditorToolbar` 元件（格式化按鈕列）
- [x] 8.9 實作 debounce 自動儲存（500ms 後觸發）
- [x] 8.10 實作切換筆記時立即儲存邏輯
- [x] 8.11 套用編輯區米白背景（`--color-editor-bg`）與系統字型

## 9. 搜尋功能（search）

- [x] 9.1 建立 `SearchBar` 元件（輸入框，支援 Ctrl/⌘+F 快速聚焦）
- [x] 9.2 實作即時搜尋邏輯（在 contentText 欄位做 substring 搜尋）
- [x] 9.3 實作搜尋跨資料夾（無視當前選中資料夾）
- [x] 9.4 實作搜尋結果關鍵字高亮（在 NoteCard 預覽文字中標示）
- [x] 9.5 實作無結果空白狀態顯示

## 10. 最近刪除功能

- [x] 10.1 「最近刪除」虛擬資料夾篩選顯示 isDeleted: true 的筆記
- [x] 10.2 筆記卡片顯示剩餘天數（如「29 天後刪除」）
- [x] 10.3 實作還原筆記功能（右鍵 → 還原備忘錄）
- [x] 10.4 實作立即永久刪除功能（右鍵 → 立即刪除，含確認對話框）

## 11. 完工驗收

- [x] 11.1 確認所有 Spec 中的 Scenario 皆可手動驗證通過
- [x] 11.2 確認深色/淺色主題切換在所有元件正確顯示
- [x] 11.3 確認 IndexedDB 在重新整理後資料完整保留
- [x] 11.4 確認 Vite build 無 TypeScript 錯誤，可正常打包
