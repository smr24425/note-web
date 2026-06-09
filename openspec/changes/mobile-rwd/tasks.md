## 1. 套件安裝

- [x] 1.1 安裝 `framer-motion`
- [x] 1.2 確認 `vite-plugin-pwa` 已安裝（此 change 與 pwa-github-deploy 共用）

## 2. Breakpoint Hooks & CSS

- [x] 2.1 建立 `src/hooks/useMediaQuery.ts`（封裝 `window.matchMedia`，返回 boolean）
- [x] 2.2 建立 `src/hooks/useBreakpoint.ts`，返回 `'mobile' | 'tablet' | 'desktop'`
- [x] 2.3 在 `index.css` 加入 `safe-area-inset` 相關 CSS 變數支援

## 3. 導航狀態機

- [x] 3.1 建立 `src/stores/useNavigationStore.ts`（Zustand），管理 `view: MobileView` 與 `history: MobileView[]`
- [x] 3.2 實作 `push(view)`、`pop()`、`reset()` actions
- [x] 3.3 在 `useFoldersStore.selectFolder` 中，手機模式下自動 push 到 `'list'` view
- [x] 3.4 在 `useNotesStore.selectNote` 中，手機模式下自動 push 到 `'editor'` view

## 4. Long Press Hook

- [x] 4.1 建立 `src/hooks/useLongPress.ts`，回傳 touch event handlers
- [x] 4.2 實作 500ms 計時、touchmove 取消邏輯
- [x] 4.3 觸發時呼叫 `navigator.vibrate(10)`（feature detection）

## 5. Mobile 元件

- [x] 5.1 建立 `src/components/mobile/MobileHeader.tsx`（標題 + 返回按鈕）
- [x] 5.2 MobileHeader 顯示當前 view 對應的標題（資料夾名稱 / 筆記列表 / 筆記標題）
- [x] 5.3 建立 `src/components/mobile/SwipeBackGesture.tsx`，包裝 framer-motion drag 邏輯
- [x] 5.4 SwipeBackGesture：偵測螢幕左側 30px edge 開始的 touch，驅動 `motionValue`
- [x] 5.5 SwipeBackGesture：手放開時判斷閾值，超過則 pop，否則 spring 回 0
- [x] 5.6 實作背景頁面同步 x offset（`useTransform`）與陰影遮罩

## 6. MobileLayout

- [x] 6.1 建立 `src/components/mobile/MobileLayout.tsx`，使用 `AnimatePresence` 管理三個 view
- [x] 6.2 設定 push 動畫：新頁 `x: '100%' → 0`，舊頁 `x: 0 → '-30%'`
- [x] 6.3 設定 pop 動畫：當前頁 `x: 0 → '100%'`，前頁 `x: '-30%' → 0`
- [x] 6.4 動畫 duration 320ms，ease `[0.25, 0.46, 0.45, 0.94]`

## 7. AppLayout 重構

- [x] 7.1 在 `AppLayout.tsx` 引入 `useBreakpoint`
- [x] 7.2 desktop/tablet 分支：沿用三欄或兩欄佈局
- [x] 7.3 mobile 分支：render `MobileLayout`
- [x] 7.4 Tablet：建立 Drawer 元件（framer-motion），漢堡按鈕控制開關
- [x] 7.5 Tablet Drawer：背後半透明遮罩，點擊關閉

## 8. NoteCard Long Press

- [x] 8.1 在 `NoteCard` 加入 `useLongPress`，觸發右鍵選單
- [x] 8.2 確認 NoteCard 最小高度 ≥ 44px

## 9. Sidebar Long Press

- [x] 9.1 在資料夾按鈕加入 `useLongPress`，觸發右鍵選單
- [x] 9.2 確認所有 sidebar 按鈕最小高度 ≥ 44px

## 10. Keyboard-Aware Toolbar

- [x] 10.1 在 `NoteEditor.tsx` 加入 `visualViewport` resize 監聽
- [x] 10.2 手機模式下工具列改為 `position: fixed; bottom: 0`
- [x] 10.3 鍵盤彈出時動態設定 `bottom = innerHeight - visualViewport.height`
- [x] 10.4 Android `window.resize` fallback

## 11. 安全區域 & 細節

- [x] 11.1 App 根元素加入 `padding-bottom: env(safe-area-inset-bottom)`
- [x] 11.2 手機 header 加入 `padding-top: env(safe-area-inset-top)`（若非 standalone 則不需要）
- [x] 11.3 禁止手機雙擊縮放（`touch-action: manipulation`）

## 12. 驗收測試（手動）

- [x] 12.1 Chrome DevTools 手機模擬器：三欄正確切換為單欄 Stack Navigation
- [x] 12.2 push/pop 動畫流暢，無閃爍
- [ ] 12.3 swipe right 返回手勢：手指跟隨、閾值判斷正確（部署後驗證）
- [ ] 12.4 真機測試（iOS Safari）：鍵盤彈出時工具列在鍵盤上方（部署後驗證）
- [ ] 12.5 真機測試（iOS Safari）：長按觸發選單並有震動（部署後驗證）
- [x] 12.6 Tablet（768px）：側邊欄 drawer 正常開關
- [x] 12.7 桌面（1280px）：原有三欄體驗不受影響
