## Why

備忘錄的「移至資料夾」功能因 ContextMenu 在每次點擊後強制關閉而無法使用；同時圖片只能透過貼上/拖曳插入，缺乏明確 UI 入口，且插入後無法放大預覽。這三項問題影響核心操作體驗，應一併修復。

## What Changes

- **修復** `ContextMenu` 子選單邏輯：「移至資料夾 ›」點擊後切換至資料夾列表（inline submenu），不再因 `onClose()` 提前清除狀態
- **新增** 編輯器工具列「插入圖片」按鈕（🖼），點擊開啟 file picker，選擇後以 base64 插入
- **新增** 圖片點擊放大預覽（Lightbox），點擊編輯器內圖片顯示全螢幕 overlay，支援 ESC / 點擊遮罩關閉

## Capabilities

### New Capabilities
- `image-lightbox`：圖片點擊全螢幕放大預覽（Lightbox overlay）

### Modified Capabilities
- `note-editor`：新增工具列插入圖片按鈕
- `note-list`：修復「移至資料夾」子選單邏輯（ContextMenu inline submenu）

## Impact

- `src/components/NoteList.tsx`：contextMenu 狀態改用 inline submenu 模式
- `src/components/ContextMenu.tsx`：加入 `submenu` / `keepOpen` 支援，或直接在 NoteList 管理子選單 items
- `src/components/EditorToolbar.tsx`：加入圖片插入按鈕
- `src/components/NoteEditor.tsx`：加入圖片 click handler → Lightbox
- `src/components/ImageLightbox.tsx`（新建）：全螢幕圖片預覽 overlay
