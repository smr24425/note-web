## Context

現有 AppLayout 以固定像素寬度（192px + 272px + flex-1）構成三欄，沒有任何 responsive 邏輯。手機視窗寬度通常 375-430px，三欄已超出範圍。本次重構目標是在不破壞桌面體驗的前提下，讓手機達到原生 App 的流暢感。

## Goals / Non-Goals

**Goals:**
- 桌面（≥ 900px）體驗不變
- Tablet（600-899px）：側邊欄改為可收合 drawer
- 手機（< 600px）：Stack Navigation，push/pop 動畫達 iOS 原生感
- swipe right 返回手勢，慣性物理感
- 工具列在鍵盤彈出時不被遮擋
- 長按觸發選單（代替右鍵）
- 安全區域支援

**Non-Goals:**
- 手機版新增滑動刪除（swipe-to-delete）——可事後加
- 手機版底部 tab bar 導航（stack 已足夠）
- 任何手機版特有的新功能

## Decisions

### 1. 動畫函式庫：Framer Motion

**選擇**：`framer-motion`

**理由**：
- `AnimatePresence` 處理元件進出動畫（push/pop 換頁）
- `useMotionValue` + `useDragControls` 追蹤 swipe 手勢位置
- `useTransform` 讓背景頁面同步位移（iOS 的層次感效果）
- `spring` 物理動畫實現慣性回彈

**替代方案**：
- 純 CSS transition：無法做到手指跟隨（要先放手才動畫）
- react-spring：API 較複雜，手勢整合需更多手動工作

---

### 2. Push/Pop 轉場設計（iOS 感的關鍵）

```
Push（進入新頁）：
  新頁：x: 100% → 0%   duration: 320ms  ease: [0.25, 0.46, 0.45, 0.94]
  舊頁：x: 0%   → -30%  同步              半透明陰影覆蓋（0 → 0.15）

Pop（返回）：
  當前頁：x: 0%   → 100%
  前一頁：x: -30% → 0%   同步恢復
```

swipe back 手勢：
- `touchstart` 記錄起始 x（只有從螢幕左側 30px 內開始才算）
- `touchmove` 即時更新 `motionValue.set(deltaX)`（手指跟隨，零延遲）
- `touchend` 判斷：速度 > 200px/s 或位移 > 螢幕寬 40% → 完成 pop；否則 spring 回 0

---

### 3. 導航狀態機

```typescript
type MobileView = 'folders' | 'list' | 'editor'

// 手機上的導航歷史（只需最多三層）
interface NavigationState {
  view: MobileView
  history: MobileView[]  // 返回用
}
```

桌面和 Tablet 完全不使用此狀態，三欄仍同時顯示。

---

### 4. 工具列跟隨鍵盤（visualViewport API）

iOS/Android 上軟鍵盤彈出時，`window.innerHeight` 不變，但 `visualViewport.height` 縮小。

```javascript
window.visualViewport.addEventListener('resize', () => {
  const keyboardHeight = window.innerHeight - window.visualViewport.height
  toolbarEl.style.bottom = `${keyboardHeight}px`
})
```

工具列改為 `position: fixed; bottom: 0`，隨鍵盤動態調整 bottom 值。

---

### 5. 長按手勢（500ms）

```typescript
function useLongPress(callback: () => void, delay = 500) {
  const timerRef = useRef<number>()
  const onTouchStart = () => {
    timerRef.current = setTimeout(callback, delay)
  }
  const onTouchEnd = () => clearTimeout(timerRef.current)
  return { onTouchStart, onTouchEnd, onTouchMove: onTouchEnd }
}
```

觸發時呼叫 `navigator.vibrate(10)`（有支援的裝置給輕微震動回饋）。

---

### 6. Breakpoint 策略

```
mobile:  < 600px    CSS media query + JS useMediaQuery hook
tablet:  600-899px  
desktop: ≥ 900px    （現有行為）
```

React 側用 `useMediaQuery('(max-width: 599px)')` 控制哪個 Layout 渲染，避免只靠 CSS 造成邏輯混亂。

## Risks / Trade-offs

| 風險 | 緩解方案 |
|------|----------|
| Framer Motion 增加 bundle size（~30kb gzip） | 只在手機 Layout 的動畫元件中 import，桌面 code path 不載入 |
| iOS Safari visualViewport 行為不穩定 | 加入 100ms debounce，避免過度觸發 layout |
| swipe back 與編輯器內橫向捲動衝突 | 只有從螢幕左側 edge（30px）開始的 touch 才判定為 swipe back |
| Android Chrome 軟鍵盤行為與 iOS 不同 | 分別測試，Android 用 `window.resize` 事件作 fallback |

## Open Questions

- Tablet drawer 是否要有半透明遮罩背景？→ 建議有，點遮罩關閉
