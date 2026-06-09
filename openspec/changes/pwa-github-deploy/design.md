## Context

備忘錄 App 以 Vite + React 建構，資料存於 IndexedDB，目前只能在本地 `localhost` 執行。目標是部署至 GitHub Pages 並加入 PWA，讓 App 可透過公開 URL 安裝與使用。GitHub Pages 為靜態檔案托管，URL 格式為 `https://<user>.github.io/<repo>/`，有 sub-path 限制需特別處理。

## Goals / Non-Goals

**Goals:**
- App 可透過 GitHub Pages URL 正常載入，JS/CSS/圖示無 404
- PWA manifest 符合 Chrome/Safari 安裝要求（至少 192px 和 512px 圖示）
- Service Worker 快取 App Shell，讓 App 在離線或網路差時仍可開啟
- GitHub Actions 在 push `main` 時自動部署，無需手動操作
- iOS Safari 加入主畫面後以全螢幕模式啟動（無瀏覽器 UI）

**Non-Goals:**
- 自訂網域設定（可事後獨立處理）
- 後端 API 或伺服器端功能
- Push Notification
- Background Sync

## Decisions

### 1. Base Path：`/note-web/`

GitHub Pages 的 URL 為 `https://username.github.io/note-web/`，Vite 預設 `base: '/'` 會導致所有靜態資源路徑錯誤（404）。

**設定**：`vite.config.ts` 加入 `base: '/note-web/'`

PWA manifest 的 `start_url` 與 `scope` 也需對應設為 `/note-web/`。

若未來要換成自訂網域，只需將 `base` 改回 `'/'` 即可。

---

### 2. PWA 工具：`vite-plugin-pwa`

**選擇**：`vite-plugin-pwa`（基於 Workbox）

**理由**：
- 與 Vite 深度整合，build 時自動產生 Service Worker
- 支援 `generateSW`（自動）與 `injectManifest`（手動）兩種模式
- 自動處理 precache manifest hash，避免快取過期問題

**模式選擇**：`generateSW`（自動產生）
- 我們不需要自訂 SW 邏輯，Workbox 預設策略即可
- 減少維護成本

**快取策略**：
```
App Shell (HTML/JS/CSS/圖示)  →  CacheFirst（precache）
                                  build 時自動加入 precache manifest
NavigationFallback            →  index.html（SPA fallback）
```

---

### 3. 圖示產生

**選擇**：手動建立 SVG 後用 `sharp` 或線上工具轉換為 PNG

最少需要：
- `pwa-192x192.png`
- `pwa-512x512.png`
- `apple-touch-icon.png`（180×180，iOS Safari 用）
- `favicon.ico` 或 `favicon.svg`

圖示設計：簡潔的筆記本造型，使用 macOS Notes 的黃色（#FFD60A）作為主題色。

---

### 4. GitHub Actions 部署

**工作流程**：
1. push `main` 觸發
2. `npm ci` → `npm run build`
3. 使用 `peaceiris/actions-gh-pages` 將 `dist/` 推送至 `gh-pages` branch

**GitHub Pages 設定**：Repository Settings → Pages → Source: `gh-pages` branch

**SPA Fallback**：GitHub Pages 不支援 SPA 路由，若使用者直接訪問子路徑會 404。
解法：在 `public/404.html` 放置 redirect script，將路徑存入 sessionStorage 後跳回 `index.html`，`index.html` 再讀取並 restore 路由。（本 App 目前沒有 URL routing，此問題影響較小，但仍需加入以保險。）

## Risks / Trade-offs

| 風險 | 緩解方案 |
|------|----------|
| `base` 設定錯誤導致資源 404 | 本地先 `vite build && vite preview` 驗證，再推送 |
| Service Worker 快取舊版本 | `vite-plugin-pwa` 預設在新版本時提示使用者重新整理 |
| iOS Safari 不支援完整 PWA | 加入 apple-touch-icon + apple-mobile-web-app-capable meta，已是最大相容範圍 |
| GitHub repo 名稱改變 | base path 需手動更新，可考慮用環境變數 `VITE_BASE_URL` |

## Open Questions

- GitHub username 為何（影響部署 URL）？→ 實作時確認
- 是否需要在 App 內顯示「安裝到主畫面」的引導提示？→ v2 考慮
