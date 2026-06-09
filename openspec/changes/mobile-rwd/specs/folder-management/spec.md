## MODIFIED Requirements

### Requirement: 長按資料夾觸發選單
手機模式下，長按資料夾項目 SHALL 觸發操作選單（等同桌面右鍵選單）。

#### Scenario: 長按資料夾觸發選單
- **WHEN** 手機使用者長按資料夾超過 500ms
- **THEN** 顯示操作選單（重新命名、刪除），並在支援的裝置上觸發輕微震動（10ms）
