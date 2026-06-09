## Why

備忘錄 App 目前只能在本地開發環境執行，無法分享給他人使用，也無法在手機上安裝到主畫面。本次變更將 App 部署至 GitHub Pages，並加入 PWA 支援，讓使用者可透過 URL 存取、離線使用，並像原生 App 一樣安裝至桌面或手機主畫面。

## What Changes

- 設定 Vite `base` 為 GitHub Pages 的子路徑（`/note-web/`）
- 加入 `vite-plugin-pwa`，自動產生 Service Worker 與 Web App Manifest
- 設計並產生多尺寸 App 圖示（192×192、512×512 等）
- 設定 PWA Manifest（名稱、主題色、display: standalone）
- 設定 Service Worker 快取策略（App Shell：StaleWhileRevalidate）
- 建立 GitHub Actions 工作流程，推送 `main` 時自動部署至 `gh-pages` branch
- 設定 404 redirect（GitHub Pages SPA fallback）

## Capabilities

### New Capabilities

- `pwa`: PWA 安裝與離線體驗，包含 manifest、Service Worker、圖示
- `github-deploy`: GitHub Pages 部署流程，包含 Vite base path 設定與 GitHub Actions CI/CD

### Modified Capabilities

（無，現有功能不受影響）

## Impact

- `vite.config.ts`：加入 `base` 與 `vite-plugin-pwa` 設定
- `index.html`：加入 meta theme-color、apple-touch-icon 等 PWA 相關 meta tag
- 新增 `public/` 圖示資源（多尺寸 PNG）
- 新增 `.github/workflows/deploy.yml`
- 依賴新增：`vite-plugin-pwa`（devDependency）
- **不影響**現有資料層、UI 元件、或 IndexedDB 邏輯
