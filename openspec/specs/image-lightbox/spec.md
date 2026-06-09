## ADDED Requirements

### Requirement: 圖片點擊放大預覽
編輯器內的圖片 SHALL 支援點擊放大預覽。點擊圖片後 SHALL 顯示全螢幕 Lightbox overlay，以最大可用空間顯示原圖，並提供關閉方式。

#### Scenario: 點擊圖片
- **WHEN** 使用者點擊編輯器內的任一圖片
- **THEN** 顯示半透明全螢幕遮罩，圖片以最大 90vw × 90vh 置中顯示

#### Scenario: 點擊遮罩關閉
- **WHEN** Lightbox 開啟時使用者點擊圖片以外的遮罩區域
- **THEN** Lightbox 關閉，回到編輯狀態

#### Scenario: 按 ESC 關閉
- **WHEN** Lightbox 開啟時使用者按下 ESC 鍵
- **THEN** Lightbox 關閉

#### Scenario: 關閉按鈕
- **WHEN** Lightbox 開啟
- **THEN** 右上角顯示關閉（✕）按鈕，點擊後關閉 Lightbox
