## ADDED Requirements

### Requirement: GitHub Pages 自動部署
推送至 `main` branch 時，App SHALL 自動建構並部署至 GitHub Pages，無需手動操作。

#### Scenario: push main 觸發部署
- **WHEN** 開發者將程式碼推送至 `main` branch
- **THEN** GitHub Actions 自動執行 build 並將 `dist/` 部署至 `gh-pages` branch，部署完成後 App 可透過 GitHub Pages URL 存取

#### Scenario: 部署失敗通知
- **WHEN** GitHub Actions workflow 中任一步驟失敗
- **THEN** GitHub 發送失敗通知至開發者，部署不進行，舊版 App 繼續提供服務

---

### Requirement: 正確的靜態資源路徑
App 部署至 GitHub Pages 子路徑後，所有 JS、CSS、圖片、字型資源 SHALL 正常載入，不出現 404。

#### Scenario: 子路徑下資源正常載入
- **WHEN** 使用者開啟 `https://username.github.io/note-web/`
- **THEN** 頁面完整渲染，DevTools Network 中無 404 資源請求

---

### Requirement: SPA Fallback
使用者直接訪問非根路徑的 URL 時，應用程式 SHALL 正常載入而非顯示 GitHub Pages 的 404 頁面。

#### Scenario: 直接訪問子路徑
- **WHEN** 使用者直接在瀏覽器輸入 App 的任意路徑
- **THEN** App 正常載入，不顯示 GitHub Pages 404 頁面
