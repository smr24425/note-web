## ADDED Requirements

### Requirement: 淺色 / 深色主題切換
應用程式 SHALL 支援淺色與深色兩種主題，使用者 SHALL 可手動切換，且設定 SHALL 在重新整理後保留。

#### Scenario: 切換為深色主題
- **WHEN** 使用者點擊主題切換按鈕選擇深色模式
- **THEN** 整個應用程式配色切換為深色主題，設定儲存至 localStorage

#### Scenario: 切換為淺色主題
- **WHEN** 使用者點擊主題切換按鈕選擇淺色模式
- **THEN** 整個應用程式配色切換為淺色主題，設定儲存至 localStorage

#### Scenario: 重新整理後保留主題
- **WHEN** 使用者設定主題後重新整理頁面
- **THEN** 應用程式載入時恢復使用者上次設定的主題

---

### Requirement: macOS Notes 淺色配色
應用程式淺色主題 SHALL 忠實還原 macOS Notes 的視覺風格。

#### Scenario: 淺色主題配色
- **WHEN** 應用程式以淺色主題顯示
- **THEN** 側邊欄背景為 #F2F2F2，筆記列表背景為 #FAFAFA，選中筆記背景為 #FFDE7D，編輯區背景為 #FFFEF2，主要文字顏色為 #1C1C1E

---

### Requirement: macOS Notes 深色配色
應用程式深色主題 SHALL 符合 macOS Notes 深色模式視覺風格。

#### Scenario: 深色主題配色
- **WHEN** 應用程式以深色主題顯示
- **THEN** 側邊欄背景為 #1C1C1E，筆記列表背景為 #2C2C2E，選中筆記背景為 #3D3000，編輯區背景為 #1C1C1E，主要文字顏色為 #F5F5F7

---

### Requirement: 系統字型
應用程式 SHALL 使用 macOS / iOS 系統字型（-apple-system, BlinkMacSystemFont, "Segoe UI"）以還原原生感受。

#### Scenario: 字型套用
- **WHEN** 應用程式載入
- **THEN** 所有文字使用系統字型 stack：-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

---

### Requirement: 跟隨系統主題
應用程式 SHALL 在使用者未手動設定主題時，自動跟隨作業系統的深色/淺色模式設定。

#### Scenario: 跟隨系統深色模式
- **WHEN** 使用者未手動設定主題，且作業系統設定為深色模式
- **THEN** 應用程式自動以深色主題顯示

#### Scenario: 跟隨系統淺色模式
- **WHEN** 使用者未手動設定主題，且作業系統設定為淺色模式
- **THEN** 應用程式自動以淺色主題顯示
