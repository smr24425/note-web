## ADDED Requirements

### Requirement: 設定頁面
App SHALL 提供一個設定頁面，以 iOS/macOS grouped sections 美學呈現，作為資料備份與外觀設定的統一入口。

#### Scenario: 開啟設定頁面
- **WHEN** 使用者點擊 Sidebar 底部的 ⚙ 齒輪按鈕
- **THEN** 設定頁面以 slide-in panel（桌面：居中 modal；手機：底部滑入）動畫開啟

#### Scenario: 關閉設定頁面
- **WHEN** 使用者點擊設定頁面外的遮罩，或點擊關閉按鈕
- **THEN** 設定頁面以動畫收起

---

### Requirement: 設定頁面 — 資料備份區塊
設定頁面 SHALL 包含一個「資料備份」grouped section，提供匯出與匯入操作。

#### Scenario: 顯示資料備份 section
- **WHEN** 設定頁面開啟
- **THEN** 顯示「📦 資料備份」section，內含「匯出備份」與「匯入備份」兩個列項，各有 › 指示符

#### Scenario: 點擊匯出備份
- **WHEN** 使用者點擊「匯出備份」列項
- **THEN** 觸發備份 JSON 檔案下載，設定頁面保持開啟

#### Scenario: 點擊匯入備份
- **WHEN** 使用者點擊「匯入備份」列項
- **THEN** 開啟系統檔案選擇器（accept=".json"），使用者選取檔案後進入匯入預覽流程

---

### Requirement: 設定頁面 — 外觀設定區塊
設定頁面 SHALL 包含「外觀」section，整合現有的主題切換功能。

#### Scenario: 顯示外觀 section
- **WHEN** 設定頁面開啟
- **THEN** 顯示「🎨 外觀」section，內含「主題」列項，右側顯示當前主題（自動 / 淺色 / 深色）

#### Scenario: 切換主題
- **WHEN** 使用者點擊「主題」列項
- **THEN** 顯示主題選項（自動 / 淺色 / 深色），選取後立即套用，並反映在列項右側文字
