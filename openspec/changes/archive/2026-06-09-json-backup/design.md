## Context

備忘錄 App 目前資料全存於瀏覽器 IndexedDB（透過 Dexie.js），沒有任何備份或遷移路徑。使用者一旦清除瀏覽器儲存空間，或換裝置，資料即永久遺失。本次設計以最低複雜度（純瀏覽器 File API，零外部依賴）實現手動備份/還原。

現有資料結構：
- `notes` 表：id, title, contentJson（Tiptap JSON，含 base64 圖片）, contentText, folderId, isPinned, isDeleted, deletedAt, createdAt, updatedAt
- `folders` 表：id, name, createdAt, updatedAt

## Goals / Non-Goals

**Goals:**
- 單一 JSON 檔案完整匯出（含圖片、已刪除資料）
- Merge-based 匯入（不會蓋掉較新的本地資料）
- 已刪除筆記匯入後進垃圾桶
- 設定頁面作為功能入口（iOS/macOS grouped sections 美學）
- 預留 `exportVersion` 以供未來 schema migration

**Non-Goals:**
- 自動定時備份（手動觸發即可）
- 雲端同步（Google Sheets 等，未來 change 處理）
- 選擇性匯出（部分資料夾或筆記）
- 版本歷史（多份快照管理）

## Decisions

### 1. JSON Schema 設計

```typescript
interface BackupFile {
  exportVersion: 1                    // schema 版本，供未來 migration 判斷
  exportedAt: string                  // ISO 8601
  appVersion: string                  // package.json version
  folders: FolderRecord[]
  notes: NoteRecord[]                 // 含 isDeleted = true 的筆記
}
```

**理由**：
- `exportVersion` 獨立於 `appVersion`，讓 schema 可以在不改 app 版號的情況下 bump
- 所有欄位都是現有 DB 欄位的直接對映，不需要轉換層
- 圖片 base64 內嵌於 `contentJson`，保持資料完整性，不需要額外檔案

---

### 2. 匯入 Merge 策略

```
對每筆 note（by id）：
  本地不存在   → INSERT（直接寫入）
  本地存在：
    remote.updatedAt > local.updatedAt → UPDATE（以匯入資料覆蓋）
    remote.updatedAt ≤ local.updatedAt → SKIP（保留本地較新版本）
  isDeleted = true → 寫入時保留 isDeleted 狀態（進垃圾桶）

對每個 folder（by id）：
  相同邏輯，以 updatedAt 為準
```

**理由**：
- updatedAt 比較比全局版號更精確（note 層級 granularity）
- 不刪除本地多出的資料（匯入是加法，不是替換）
- 與未來 Google Sheets sync 的 merge 邏輯完全相同，可複用

**替代方案考慮**：
- **覆蓋模式（Replace All）**：簡單但危險，一鍵毀資料，已排除
- **追加模式（Append All）**：產生重複筆記，已排除

---

### 3. 設定頁面 UI 方案

**選擇**：底部滑入 Sheet（類 iOS Action Sheet / Settings Panel）

```
Sidebar ⚙ → 從底部或右側滑入 SettingsPanel
SettingsPanel 包含 grouped sections（iOS Settings 樣式）
```

**理由**：
- 與現有 app modal 模式一致（ConfirmDialog 也是 overlay）
- 不破壞現有三欄佈局
- 手機/桌面都適用（手機底部滑入，桌面可作居中 modal）
- 之後加入 Google Sheets 設定欄位，只需在同一頁加 section

**替代方案**：
- 獨立路由頁面：需要引入 React Router，complexity 增加，已排除
- Sidebar inline 展開：擠壓現有 sidebar 空間，已排除

---

### 4. 匯出實作（File API）

```typescript
// 觸發瀏覽器下載，零依賴
const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = `notes-backup-${date}.json`
a.click()
URL.revokeObjectURL(url)
```

---

### 5. 匯入實作（FileReader API）

```typescript
// <input type="file" accept=".json"> 觸發
const reader = new FileReader()
reader.onload = (e) => {
  const backup = JSON.parse(e.target.result as string)
  // 版本檢查 → 預覽摘要 → 確認 → Merge 寫入
}
```

確認 Dialog 顯示：「將新增 X 筆、更新 Y 筆筆記，X 個資料夾」

## Risks / Trade-offs

| 風險 | 緩解方案 |
|------|----------|
| 大型 base64 圖片使 JSON 超過 100MB | 匯入前顯示檔案大小警告；匯出前顯示預估大小 |
| 使用者在確認前不知道會改變什麼 | 匯入預覽 Dialog 顯示影響摘要，需二次確認 |
| `exportVersion` 未來不相容 | 匯入時若 `exportVersion` > 已知版本，提示「版本不相容」並拒絕 |
| 手機版 File download API 行為不一 | iOS Safari 不支援 `<a download>`，改用 `window.open(blobUrl)` 或 share API fallback |

## Open Questions

- 匯出檔案名稱格式：`notes-backup-2026-06-09.json` 夠清楚嗎？
- 是否在設定頁顯示「上次備份時間」（存 localStorage）？
