## 1. 備份邏輯（src/lib/backup.ts）

- [x] 1.1 建立 `src/lib/backup.ts`，定義 `BackupFile` TypeScript interface（exportVersion, exportedAt, folders, notes）
- [x] 1.2 實作 `exportBackup()`：讀取所有 folders + notes（含 isDeleted），序列化成 JSON，觸發瀏覽器下載
- [x] 1.3 iOS Safari fallback：若 `<a download>` 不支援，改用 `window.open(blobUrl)` 或 Web Share API
- [x] 1.4 實作 `parseBackupFile(json: string)`：驗證 `exportVersion`（不相容則 throw）、驗證必要欄位
- [x] 1.5 實作 `mergeBackup(backup: BackupFile)`：逐筆 folders / notes 以 `updatedAt` 比較，寫入 Dexie DB
- [x] 1.6 `mergeBackup` 回傳摘要：`{ addedNotes, updatedNotes, addedFolders, updatedFolders }`

## 2. 設定狀態管理

- [x] 2.1 建立 `src/stores/useSettingsStore.ts`（Zustand），管理 `isOpen: boolean` 與 `open() / close()` actions
- [x] 2.2 建立 `src/stores/useThemeStore.ts` 的 `theme` 選項常數（`'auto' | 'light' | 'dark'`）供設定頁使用（若尚未定義）

## 3. 設定頁面 UI（src/components/SettingsPanel.tsx）

- [x] 3.1 建立 `src/components/SettingsPanel.tsx`，使用 framer-motion 實作 slide-in overlay（桌面居中 modal，手機底部滑入）
- [x] 3.2 實作遮罩層（半透明背景），點擊關閉面板
- [x] 3.3 實作 iOS 風格 grouped section 元件（section header + 圓角卡片 + 分隔線）
- [x] 3.4 「📦 資料備份」section：「匯出備份」列項（點擊觸發 `exportBackup()`）
- [x] 3.5 「📦 資料備份」section：「匯入備份」列項（點擊觸發 `<input type="file">` 開啟）
- [x] 3.6 「🎨 外觀」section：「主題」列項，右側顯示當前主題，點擊顯示三選一選項（自動 / 淺色 / 深色）
- [x] 3.7 設定頁面頂部顯示「設定」標題與關閉按鈕（✕）
- [x] 3.8 「ℹ 關於」section：顯示 App 版本號

## 4. 匯入確認 Dialog

- [x] 4.1 在 SettingsPanel 內整合 `ConfirmDialog`，匯入前顯示「將新增 X 筆、更新 Y 筆筆記，X 個資料夾」摘要
- [x] 4.2 使用者確認後呼叫 `mergeBackup()`，完成後顯示 Toast 通知「匯入完成」
- [x] 4.3 實作 Toast 通知元件（簡單的 bottom toast，2 秒自動消失）或複用現有通知機制

## 5. Sidebar 整合

- [x] 5.1 在 `Sidebar.tsx` 底部操作區加入 ⚙ 齒輪按鈕，與「新增資料夾」按鈕並排
- [x] 5.2 點擊齒輪按鈕呼叫 `useSettingsStore.open()`
- [x] 5.3 將 `SettingsPanel` 渲染至 `App.tsx` 的根層（避免被其他元素遮擋）

## 6. 錯誤處理

- [x] 6.1 `parseBackupFile` 失敗（格式錯誤）時顯示 Toast 錯誤訊息「檔案格式不正確」
- [x] 6.2 `exportVersion` 不相容時顯示 Toast 錯誤訊息「備份版本不相容，請更新 App 後再試」

## 7. 驗收測試

- [x] 7.1 匯出：下載的 JSON 包含所有筆記（含圖片、已刪除），`exportVersion: 1`
- [x] 7.2 匯入：選取合法備份，預覽摘要正確，確認後資料 merge 進 DB
- [x] 7.3 Merge 策略：本地較新的筆記不被覆蓋，本地較舊的筆記被更新
- [x] 7.4 已刪除筆記匯入後出現在垃圾桶
- [x] 7.5 選取無效 JSON → 顯示錯誤 Toast，不崩潰
- [x] 7.6 設定頁面主題切換功能正常（搬移自 Sidebar）
- [x] 7.7 iOS Safari：匯出檔案可正常下載
