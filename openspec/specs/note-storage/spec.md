## ADDED Requirements

### Requirement: 本地資料持久化
應用程式 SHALL 使用瀏覽器 IndexedDB（via Dexie.js）作為唯一資料儲存層，所有筆記與資料夾資料 SHALL 在頁面重新整理或關閉後保留。

#### Scenario: 重新整理後資料保留
- **WHEN** 使用者建立筆記後重新整理頁面
- **THEN** 所有筆記內容完整保留，無資料遺失

#### Scenario: 關閉後重開保留資料
- **WHEN** 使用者關閉瀏覽器後重新開啟應用程式
- **THEN** 所有筆記與資料夾完整保留

---

### Requirement: 筆記 CRUD
儲存層 SHALL 提供筆記的建立、讀取、更新、刪除操作。

#### Scenario: 建立筆記
- **WHEN** 呼叫建立筆記操作
- **THEN** 以 UUID 作為 id 建立新筆記記錄，createdAt 與 updatedAt 設為當前時間

#### Scenario: 更新筆記
- **WHEN** 呼叫更新筆記操作（傳入 id 與新內容）
- **THEN** 筆記的 contentJson、contentText、title 更新，updatedAt 更新為當前時間

#### Scenario: 軟刪除筆記
- **WHEN** 呼叫刪除筆記操作
- **THEN** 筆記的 isDeleted 設為 true、deletedAt 設為當前時間，記錄不從資料庫移除

---

### Requirement: 資料夾 CRUD
儲存層 SHALL 提供資料夾的建立、讀取、更新、刪除操作。

#### Scenario: 建立資料夾
- **WHEN** 呼叫建立資料夾操作
- **THEN** 以 UUID 作為 id 建立新資料夾記錄

#### Scenario: 刪除資料夾
- **WHEN** 呼叫刪除資料夾操作（傳入 id）
- **THEN** 資料夾記錄從資料庫移除，同時對應筆記的 folderId 清空（設為 null）

---

### Requirement: 資料庫 Schema 版本管理
儲存層 SHALL 使用 Dexie.js 的版本管理機制，確保未來 Schema 升級時可安全 migration。

#### Scenario: 首次開啟應用程式
- **WHEN** 使用者首次在瀏覽器開啟應用程式
- **THEN** Dexie 自動建立 IndexedDB 資料庫與對應的 Schema（notes、folders 資料表）

#### Scenario: Schema 版本升級
- **WHEN** 新版應用程式部署後使用者開啟頁面
- **THEN** Dexie migration 自動執行，既有資料安全保留
