## Purpose

提供使用者將所有資料夾與筆記匯出為 JSON 備份檔案，並支援以 Merge 策略將備份匯入的功能，確保資料可攜性與版本相容性。

---

## Requirements

### Requirement: 匯出備份
使用者 SHALL 能夠將所有資料夾與筆記（含已刪除）匯出為單一 JSON 檔案並下載到裝置。

#### Scenario: 觸發匯出
- **WHEN** 使用者在設定頁點擊「匯出備份」
- **THEN** 瀏覽器下載一個 JSON 檔案，檔名格式為 `notes-backup-YYYY-MM-DD.json`，內含所有資料夾、所有筆記（含 isDeleted=true 者）及圖片 base64 資料

#### Scenario: 匯出包含已刪除筆記
- **WHEN** 垃圾桶中有筆記時執行匯出
- **THEN** 匯出檔案中包含這些筆記，且 `isDeleted` 欄位為 `true`

---

### Requirement: 匯入備份（Merge）
使用者 SHALL 能夠選取 JSON 備份檔案，以 Merge 策略匯入資料，不覆蓋本地較新的資料。

#### Scenario: 顯示匯入預覽
- **WHEN** 使用者選取合法的備份 JSON 檔案
- **THEN** 顯示確認 Dialog，內含「將新增 X 筆、更新 Y 筆筆記、X 個資料夾」摘要，需使用者確認才執行

#### Scenario: Merge 保留較新的本地資料
- **WHEN** 本地某筆記的 `updatedAt` 晚於備份中同 ID 筆記的 `updatedAt`
- **THEN** 該筆記保留本地版本，不被備份資料覆蓋

#### Scenario: 已刪除筆記匯入至垃圾桶
- **WHEN** 備份中某筆記的 `isDeleted` 為 `true`
- **THEN** 匯入後該筆記出現在垃圾桶，不出現在一般筆記列表

#### Scenario: 版本不相容的備份
- **WHEN** 備份檔案的 `exportVersion` 高於 App 支援的版本
- **THEN** 顯示錯誤訊息「備份版本不相容，請更新 App 後再試」，不執行匯入

#### Scenario: 匯入無效檔案
- **WHEN** 使用者選取非有效備份格式的 JSON（缺少 `exportVersion` 或 `notes` 欄位）
- **THEN** 顯示錯誤訊息「檔案格式不正確」，不執行匯入

---

### Requirement: 備份 JSON Schema
備份檔案 SHALL 遵循版本化 schema，以確保未來可 migration。

#### Scenario: 匯出檔案包含版本資訊
- **WHEN** 執行匯出
- **THEN** 產生的 JSON 檔案頂層包含 `exportVersion: 1`、`exportedAt`（ISO 8601）、`folders` 陣列、`notes` 陣列
