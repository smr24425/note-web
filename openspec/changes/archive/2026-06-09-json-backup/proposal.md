## Why

使用者的備忘錄資料儲存於瀏覽器 IndexedDB，清除瀏覽器資料或換設備時資料即遺失。提供 JSON 匯出入功能，讓使用者可以手動備份、還原，以及在不同設備間搬移資料。

## What Changes

- 新增**匯出**功能：將所有資料夾、筆記（含圖片 base64）序列化成單一 JSON 檔案並下載
- 新增**匯入**功能：讀取 JSON 備份檔，以 updatedAt 為基準 merge 進本地資料庫（不覆蓋較新的本地資料）
- 已刪除的筆記匯入後進入垃圾桶（保留 isDeleted 狀態）
- 新增**設定頁面**（iOS/macOS 美學，grouped sections），作為資料備份與外觀設定的統一入口
- Sidebar 底部加入 ⚙ 齒輪按鈕進入設定頁

## Capabilities

### New Capabilities

- `json-backup`: 備份資料的匯出入邏輯、JSON schema（含版本號 `exportVersion`）、Merge 策略
- `settings-page`: 設定頁面 UI（slide-in panel，iOS 風格 grouped sections），包含資料備份區塊與外觀設定

### Modified Capabilities

- `folder-management`: Sidebar 底部新增 ⚙ 設定入口按鈕（佈局變動）

## Impact

- **新增依賴**：無（使用瀏覽器原生 File API / FileReader API）
- **修改元件**：`Sidebar.tsx`（加入設定按鈕）
- **新增元件**：`SettingsPanel.tsx`、`src/lib/backup.ts`（匯出入邏輯）
- **新增 Zustand store**：`useSettingsStore.ts`（管理設定面板開關狀態）
- **資料庫**：只讀寫現有 `notes` / `folders` 表，不新增資料表
