## ADDED Requirements

### Requirement: Stack Navigation
手機模式（< 600px）SHALL 採用 Stack Navigation，使用者逐層進入（資料夾 → 筆記列表 → 編輯器），並可逐層返回。

#### Scenario: 點擊資料夾進入筆記列表
- **WHEN** 手機使用者點擊側邊欄的資料夾或「所有備忘錄」
- **THEN** 筆記列表以 push 動畫（從右滑入）進入畫面，資料夾列表向左退出

#### Scenario: 點擊筆記進入編輯器
- **WHEN** 手機使用者點擊筆記列表中的一則筆記
- **THEN** 編輯器以 push 動畫進入畫面，筆記列表向左退出

#### Scenario: 返回按鈕 pop 導航
- **WHEN** 手機使用者點擊頂部的返回按鈕
- **THEN** 當前頁面以 pop 動畫（向右滑出）退場，前一頁從左恢復

---

### Requirement: Swipe Back 手勢
手機模式 SHALL 支援從螢幕左側邊緣向右滑動的返回手勢，動畫跟隨手指即時移動。

#### Scenario: 手指跟隨即時移動
- **WHEN** 手機使用者從螢幕左側 30px 範圍內開始向右滑動
- **THEN** 當前頁面即時跟隨手指向右移動，背景頁面同步從左側局部露出

#### Scenario: 超過閾值完成返回
- **WHEN** 使用者滑動超過螢幕寬度 40% 或滑動速度超過 200px/s 後放手
- **THEN** 動畫以 spring 物理彈性完成 pop，返回上一頁

#### Scenario: 未超過閾值回彈
- **WHEN** 使用者滑動未達閾值後放手
- **THEN** 當前頁面以 spring 動畫彈回原位，不觸發導航

---

### Requirement: Push/Pop 動畫品質
Push/Pop 轉場動畫 SHALL 達到 iOS 原生感，新頁從右滑入同時舊頁向左退出。

#### Scenario: Push 動畫
- **WHEN** 導航 push 新頁面
- **THEN** 新頁面從 x: 100% 滑入至 x: 0%，舊頁面同時從 x: 0% 退至 x: -30%，並有輕微陰影遮罩

#### Scenario: Pop 動畫
- **WHEN** 導航 pop 返回
- **THEN** 當前頁從 x: 0% 滑出至 x: 100%，前一頁從 x: -30% 恢復至 x: 0%
