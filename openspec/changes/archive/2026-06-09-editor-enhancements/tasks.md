## 1. 共用工具函數

- [x] 1.1 建立 `src/lib/imageUtils.ts`，將 `fileToBase64` 從 `NoteEditor.tsx` 搬移至此，並在 `NoteEditor.tsx` 更新 import

## 2. 修復「移至資料夾」

- [x] 2.1 在 `src/components/ContextMenu.tsx` 的 `MenuItem` interface 加入 `keepOpen?: boolean`
- [x] 2.2 `ContextMenu` 的 item onClick handler 改為：`if (!item.keepOpen) onClose()`
- [x] 2.3 在 `NoteList.tsx` 加入 `contextMenuMode: 'main' | 'move'` state
- [x] 2.4 將「移至資料夾 ›」item 的 `onClick` 改為 `setContextMenuMode('move')`，加上 `keepOpen: true`
- [x] 2.5 `moveItems` 開頭加入「‹ 返回」item（`keepOpen: true`，onClick 設回 `'main'`）
- [x] 2.6 無自訂資料夾時在 `moveItems` 顯示「尚無資料夾」（disabled 文字）
- [x] 2.7 contextMenu 關閉時同時重置 `contextMenuMode` 為 `'main'`

## 3. 工具列「插入圖片」按鈕

- [x] 3.1 在 `EditorToolbar.tsx` 加入 `useRef<HTMLInputElement>` 指向隱藏的 `<input type="file" accept="image/*">`
- [x] 3.2 加入插入圖片按鈕（圖示），點擊時呼叫 `fileInputRef.current?.click()`
- [x] 3.3 `onChange` handler：讀取 `files[0]`，檢查 2MB 限制，超過則 alert
- [x] 3.4 使用 `imageUtils.fileToBase64` 轉換，呼叫 `editor.commands.setImage({ src })` 插入

## 4. ImageLightbox 元件

- [x] 4.1 建立 `src/components/ImageLightbox.tsx`，接受 `src: string | null` 與 `onClose: () => void` props
- [x] 4.2 使用 `AnimatePresence` + `motion.div` 實作半透明遮罩淡入淡出
- [x] 4.3 圖片以 `max-w-[90vw] max-h-[90vh] object-contain` 置中顯示
- [x] 4.4 右上角加入 ✕ 關閉按鈕
- [x] 4.5 點擊遮罩（非圖片區域）呼叫 `onClose`
- [x] 4.6 `useEffect` 監聽 `keydown` ESC 鍵呼叫 `onClose`

## 5. NoteEditor 整合 Lightbox

- [x] 5.1 在 `NoteEditor.tsx` 加入 `lightboxSrc: string | null` state
- [x] 5.2 在編輯器容器加入 `onClick` handler，判斷 `e.target instanceof HTMLImageElement` 時設定 `lightboxSrc`
- [x] 5.3 渲染 `<ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />`

## 6. 驗收

- [x] 6.1 右鍵筆記 → 移至資料夾 → 選擇資料夾 → 筆記成功移動
- [x] 6.2 右鍵筆記 → 移至資料夾 → ‹ 返回 → 回到主選單
- [x] 6.3 無資料夾時顯示「尚無資料夾」提示
- [x] 6.4 工具列圖片按鈕 → 選取圖片 → 圖片插入至編輯器
- [x] 6.5 工具列圖片按鈕 → 選取超過 2MB → 顯示警告，不插入
- [x] 6.6 點擊編輯器內圖片 → Lightbox 開啟，顯示原圖
- [x] 6.7 點擊遮罩或 ✕ 或 ESC → Lightbox 關閉
