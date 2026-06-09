## Context

目前有三個獨立問題：
1. `ContextMenu` 在所有 item 點擊後一律呼叫 `onClose()`，導致「移至資料夾 ›」點擊後立刻清除 `contextMenu` 狀態，子選單永遠無法渲染。
2. 圖片雖然支援 paste/drag 插入，但工具列沒有明顯的「插入圖片」按鈕入口，使用者難以發現。
3. Tiptap 的 `Image` extension 渲染 `<img>`，沒有任何點擊放大互動。

## Goals / Non-Goals

**Goals:**
- 修復「移至資料夾」選單邏輯，讓使用者能成功移動筆記
- 工具列新增圖片插入按鈕
- 點擊圖片顯示 Lightbox 放大預覽

**Non-Goals:**
- 不修改 ContextMenu 元件本身（避免影響 Sidebar 的資料夾右鍵選單）
- 不支援圖片縮放、旋轉等進階操作
- 不支援遠端 URL 圖片（保持純 base64 儲存策略）

## Decisions

### 決策 1：移至資料夾 — inline submenu in NoteList，不改 ContextMenu

**選項 A**：修改 `ContextMenu` 元件，加入 `keepOpen` / `submenu` prop
- 優：通用，未來可複用
- 缺：影響現有的 Sidebar 使用方式，需要仔細測試

**選項 B**：在 `NoteList.tsx` 用 `submenuMode` state 控制 `ContextMenu` 顯示的 items（本次採用）
- 優：不動 `ContextMenu` 元件，改動範圍最小
- 實作：
  ```
  type ContextMenuMode = 'main' | 'move'
  [contextMenuMode, setContextMenuMode] = useState<ContextMenuMode>('main')

  mainItems = [
    '置頂 / 取消置頂',
    { label: '移至資料夾 ›', onClick: () => setContextMenuMode('move') },  // 不呼叫 onClose
    '刪除備忘錄',
  ]

  moveItems = [
    { label: '‹ 返回', onClick: () => setContextMenuMode('main') },
    ...folders.map(...)
  ]
  ```
  關鍵：`ContextMenu` 的 item 點擊後預設仍呼叫 `onClose`，但「移至資料夾 ›」和「‹ 返回」需要阻止這個行為。
  解法：在 `NoteList.tsx` 內部不透過 `ContextMenu.items[].onClick` 切換，而是在傳入的 items 內使用 `e.stopPropagation()` 或更換 ContextMenu 中的行為。
  
  實際上最乾淨的做法：在 `ContextMenu` 加入 `onItemClick?: (item, close) => void`，讓呼叫方決定是否關閉。或直接讓 `ContextMenu` 接受 `closeOnClick?: boolean`（per-item）。

  **最終決定**：在 `MenuItem` interface 加入 `keepOpen?: boolean`，若為 true 則 item 點擊後不呼叫 `onClose()`。這是最小修改且向後相容。

### 決策 2：插入圖片按鈕 — file input + 複用現有 base64 邏輯

`EditorToolbar.tsx` 加入隱藏的 `<input type="file" accept="image/*">`，按鈕點擊觸發 `.click()`，`onChange` 事件讀取檔案轉 base64，呼叫 `editor.commands.setImage({ src })` 插入。複用 `NoteEditor.tsx` 已有的 `fileToBase64` 函數，將其移至 `src/lib/imageUtils.ts` 共享。

### 決策 3：Lightbox — 純 DOM click 事件監聽，不修改 Tiptap extension

在 `NoteEditor.tsx` 的編輯器容器上監聽 `click` 事件，判斷 `e.target` 為 `HTMLImageElement` 時取其 `src` 存入 state，渲染 `ImageLightbox` 元件。  
使用 `AnimatePresence` + `motion.div` 做淡入淡出動畫（與專案其他 overlay 一致）。  
ESC 關閉透過 `useEffect` 監聽 `keydown` 事件。

## Risks / Trade-offs

- [ContextMenu `keepOpen` 修改] 向後相容，現有 Sidebar 未傳 `keepOpen` 預設行為不變 → 低風險
- [Lightbox click 監聽] 在 `readOnly` 模式或行動裝置上也會觸發，需確認不衝突 → 可接受，lightbox 在兩種情境都合理
- [fileToBase64 搬移] 需同步更新 `NoteEditor.tsx` 的 import → 小型重構，低風險
