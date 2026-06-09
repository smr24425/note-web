## 1. Vite Base Path 設定

- [x] 1.1 在 `vite.config.ts` 加入 `base: '/note-web/'`
- [x] 1.2 本地執行 `npm run build && npx vite preview` 驗證資源路徑正確

## 2. PWA 套件安裝與設定

- [x] 2.1 安裝 `vite-plugin-pwa`（devDependency）
- [x] 2.2 在 `vite.config.ts` 引入並設定 `VitePWA` plugin（generateSW 模式）
- [x] 2.3 設定 manifest：`name`、`short_name`、`description`、`theme_color`（#FFD60A）、`background_color`、`display: standalone`
- [x] 2.4 設定 `start_url` 與 `scope` 為 `/note-web/`
- [x] 2.5 設定 Workbox `globPatterns` 快取所有 JS/CSS/HTML/圖示

## 3. App 圖示製作

- [x] 3.1 設計 App 圖示 SVG（筆記本造型，黃色主題色 #FFD60A）
- [x] 3.2 產生 `pwa-192x192.png`（用於 Android 安裝）
- [x] 3.3 產生 `pwa-512x512.png`（用於 Splash Screen / 高解析度）
- [x] 3.4 產生 `apple-touch-icon.png`（180×180，iOS Safari 加入主畫面）
- [x] 3.5 產生 `favicon.ico` 或 `favicon.svg`
- [x] 3.6 將所有圖示放入 `public/` 目錄

## 4. HTML Meta Tags

- [x] 4.1 在 `index.html` 加入 `<meta name="theme-color" content="#FFD60A">`
- [x] 4.2 加入 `<meta name="apple-mobile-web-app-capable" content="yes">`
- [x] 4.3 加入 `<meta name="apple-mobile-web-app-status-bar-style" content="default">`
- [x] 4.4 加入 `<link rel="apple-touch-icon" href="/note-web/apple-touch-icon.png">`

## 5. SPA Fallback（GitHub Pages 404 處理）

- [x] 5.1 建立 `public/404.html`，內含 redirect script 將路徑存入 sessionStorage 後跳回根路徑
- [x] 5.2 在 `index.html` 的 `<head>` 加入對應的 restore script

## 6. GitHub Actions 部署流程

- [x] 6.1 建立 `.github/workflows/deploy.yml`
- [x] 6.2 設定觸發條件：`push` 至 `main` branch
- [x] 6.3 設定 build steps：`npm ci` → `npm run build`
- [x] 6.4 使用 `peaceiris/actions-gh-pages@v3` 將 `dist/` 推送至 `gh-pages` branch
- [ ] 6.5 在 GitHub Repository Settings 啟用 Pages，Source 設為 `gh-pages` branch

## 7. 驗收測試

- [x] 7.1 本地 `vite build` 無錯誤，`vite preview` 可正常載入
- [ ] 7.2 Chrome DevTools Lighthouse PWA 檢查：通過 Installable 項目
- [ ] 7.3 Chrome 地址欄出現安裝圖示，點擊後可安裝至桌面
- [ ] 7.4 安裝後以 standalone 模式開啟，顯示正確圖示與主題色
- [ ] 7.5 離線模式下（DevTools → Network → Offline）App 可正常開啟
- [ ] 7.6 push `main` 後 GitHub Actions 成功執行，App 透過 GitHub Pages URL 正常載入
