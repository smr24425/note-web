## Why

備忘錄 App 目前採用固定三欄佈局，在手機螢幕（< 600px）上側邊欄與列表合計已超過畫面寬度，編輯區完全無法顯示。本次變更加入完整的響應式設計與原生感手機導航，讓 App 在手機上達到與 iOS Notes 相近的使用體驗，包含流暢的滑動切換與觸控操作。

## What Changes

- **BREAKING** 重構 `AppLayout` 為響應式三段式佈局（desktop / tablet / mobile）
- 手機導航改為 Stack Navigation（資料夾列表 → 筆記列表 → 編輯器，逐層 push/pop）
- 加入 Framer Motion 手勢驅動的 push/pop 轉場動畫（translateX + 物理慣性）
- 實作 swipe right 返回手勢
- 工具列在手機鍵盤彈出時跟隨鍵盤位置（visualViewport API）
- 長按筆記/資料夾觸發右鍵選單（代替桌面 contextmenu）
- 所有可互動元素確保最小 44×44px 觸控目標
- 底部安全區域支援（iPhone home indicator）
- Tablet（600-899px）：側邊欄隱藏，漢堡按鈕開啟 drawer

## Capabilities

### New Capabilities

- `mobile-navigation`: 手機 Stack Navigation、push/pop 動畫、swipe back 手勢
- `responsive-layout`: 三段響應式佈局（desktop/tablet/mobile），Tablet drawer

### Modified Capabilities

- `note-editor`: 工具列跟隨鍵盤（visualViewport），觸控目標大小調整
- `note-list`: 長按觸發右鍵選單，觸控目標大小調整
- `folder-management`: 長按觸發右鍵選單，觸控目標大小調整

## Impact

- `AppLayout.tsx`：完全重寫，加入 breakpoint 判斷與手機導航
- `NoteEditor.tsx`：新增 visualViewport keyboard handling
- `NoteList.tsx`：新增長按事件處理
- `Sidebar.tsx`：新增長按事件處理、Tablet drawer 模式
- 新增 `MobileNav.tsx`、`useNavigationStore.ts`、`useLongPress.ts`
- 依賴新增：`framer-motion`
