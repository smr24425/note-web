## Why

目前缺乏一個可在瀏覽器中使用、體驗貼近 macOS 原生備忘錄的 Web 應用程式。本專案旨在以 React 建構一個完全在地端運行的備忘錄工具，無需後端、無需帳號，讓使用者可以在任何有瀏覽器的環境快速記錄想法。

## What Changes

- 全新建立 React + Vite 前端專案
- 三欄式佈局：資料夾側邊欄、筆記列表、編輯區
- 富文字編輯器（基於 Tiptap v2），支援 Mac Notes 風格格式化
- 核取清單（Checklist）功能
- 資料夾管理（建立、重新命名、刪除）
- 筆記置頂（Pin）功能
- 最近刪除資料夾（軟刪除，30 天後自動清除）
- 全文即時搜尋
- 筆記排序（依修改時間、建立時間、標題）
- 本地持久化（IndexedDB via Dexie.js）
- 深色 / 淺色主題切換
- 忠實還原 macOS Notes 視覺風格（選中黃底、米白編輯區、San Francisco 字型）
- 鍵盤快捷鍵支援（⌘N、⌘F 等）

## Capabilities

### New Capabilities

- `note-editor`: 富文字編輯器核心，支援標題自動化、粗/斜/底線、有序/無序/核取清單、連結、圖片貼入、表格
- `note-list`: 筆記列表面板，顯示標題、日期、預覽文字，支援置頂、排序、選取高亮
- `folder-management`: 資料夾側邊欄，支援建立、重新命名、刪除資料夾，以及「所有備忘錄」與「最近刪除」虛擬資料夾
- `note-storage`: 本地資料持久化層（IndexedDB），管理筆記 CRUD、資料夾 CRUD、軟刪除邏輯
- `search`: 全文即時搜尋，關鍵字高亮，跨資料夾搜尋
- `app-theme`: 深色/淺色主題系統，配色忠實還原 macOS Notes 設計語言

### Modified Capabilities

（無，為全新專案）

## Impact

- 全新建立專案，無現有程式碼受影響
- 依賴套件：React 18、Vite、Tiptap v2、Dexie.js、Zustand、Tailwind CSS、dnd-kit
- 僅使用瀏覽器 IndexedDB，無伺服器端依賴
- 支援現代瀏覽器（Chrome、Firefox、Safari、Edge 最新版）
