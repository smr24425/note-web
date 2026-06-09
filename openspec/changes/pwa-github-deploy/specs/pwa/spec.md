## ADDED Requirements

### Requirement: Web App Manifest
應用程式 SHALL 提供符合 PWA 規範的 `manifest.json`，使瀏覽器能識別並提供安裝提示。

#### Scenario: Chrome 顯示安裝提示
- **WHEN** 使用者在 Chrome 中開啟 App 超過一次且符合安裝條件
- **THEN** 瀏覽器顯示「安裝到桌面」的提示或地址欄出現安裝圖示

#### Scenario: Manifest 欄位完整
- **WHEN** 使用 Lighthouse 或 Chrome DevTools 檢查 manifest
- **THEN** `name`、`short_name`、`icons`（含 192px 和 512px）、`start_url`、`display: standalone`、`theme_color`、`background_color` 皆存在且有效

---

### Requirement: 離線可啟動
應用程式 SHALL 在無網路連線時仍可開啟，並顯示完整 UI（資料來自 IndexedDB，已為本地）。

#### Scenario: 離線開啟 App
- **WHEN** 使用者在無網路環境下開啟已訪問過的 App URL
- **THEN** App 正常載入，顯示筆記列表，使用者可正常讀寫筆記

#### Scenario: Service Worker 安裝成功
- **WHEN** 使用者首次開啟 App（有網路）
- **THEN** Service Worker 在背景安裝並快取 App Shell 資源

---

### Requirement: iOS 主畫面全螢幕
iOS Safari 加入主畫面後，App SHALL 以全螢幕模式啟動，無瀏覽器 UI。

#### Scenario: iOS 加入主畫面後啟動
- **WHEN** 使用者在 iOS Safari 將 App 加入主畫面後點擊圖示開啟
- **THEN** App 以全螢幕顯示，沒有 Safari 的網址列和工具列

---

### Requirement: App 圖示
應用程式 SHALL 提供多尺寸高品質圖示，用於安裝後顯示在桌面/主畫面。

#### Scenario: 桌面安裝圖示
- **WHEN** 使用者在桌面安裝 PWA 後
- **THEN** 顯示 512×512 或適合平台的圖示，不模糊、不失真

#### Scenario: iOS 主畫面圖示
- **WHEN** iOS 使用者將 App 加入主畫面
- **THEN** 顯示 180×180 的 apple-touch-icon，圖示清晰
