## ADDED Requirements

### Requirement: 三段響應式佈局
應用程式 SHALL 根據視窗寬度自動切換為桌面（≥ 900px）、平板（600-899px）、手機（< 600px）三種佈局。

#### Scenario: 桌面佈局不受影響
- **WHEN** 使用者在 ≥ 900px 的視窗開啟 App
- **THEN** 顯示原有三欄並排佈局，行為與 v1 完全相同

#### Scenario: 平板佈局
- **WHEN** 使用者在 600-899px 的視窗開啟 App
- **THEN** 側邊欄隱藏，顯示筆記列表與編輯器兩欄；頂部出現漢堡按鈕可開啟側邊欄 drawer

#### Scenario: 手機佈局
- **WHEN** 使用者在 < 600px 的視窗開啟 App
- **THEN** 僅顯示單欄，採用 Stack Navigation（預設顯示資料夾列表或筆記列表）

---

### Requirement: Tablet Drawer
平板模式 SHALL 提供可滑出的側邊欄 Drawer，點擊漢堡按鈕或遮罩可開關。

#### Scenario: 開啟 Drawer
- **WHEN** 平板使用者點擊漢堡按鈕
- **THEN** 側邊欄從左側滑入，背後出現半透明遮罩

#### Scenario: 關閉 Drawer
- **WHEN** 平板使用者點擊遮罩或再次點擊漢堡按鈕
- **THEN** 側邊欄向左滑出關閉

---

### Requirement: 安全區域支援
應用程式 SHALL 尊重 iOS 的底部安全區域，避免 UI 元素被 home indicator 遮擋。

#### Scenario: iPhone 底部安全區域
- **WHEN** App 在 iPhone（有 home indicator）上以 standalone 模式開啟
- **THEN** 底部的工具列和導航按鈕不被 home indicator 遮擋，有足夠的 padding
