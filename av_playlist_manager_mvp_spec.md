# AV Playlist Manager MVP 開發規格文件

版本：v0.1  
狀態：MVP 規劃稿  
目標：2 週內做出可用原型  
產品型態：Web App（桌面優先，可延伸手機瀏覽器）

---

## 1. 產品定位

AV Playlist Manager 不是影音站，也不是下載站。  
它的核心是：**以影片編號（video code）為中心的收藏、分組、分享與補全工具**。

使用者可以：

- 新增影片編號（例如 `SSIS-123`、`IPX-920`）
- 把影片加入自己的 playlist / group
- 匯出純文字清單
- 分享公開清單給別人
- 根據個人偏好的來源站，自動補全成對應網址

### 核心價值

1. **ID-first**：不是以單一來源網址為核心，而是以影片編號為核心。
2. **可整理**：把零散收藏變成可搜尋、可分組的清單。
3. **可分享**：別人拿到 code list 後，可以依自己的偏好站點補全網址。
4. **可延伸**：未來可加入標籤、推薦系統、社群公開收藏。

---

## 2. MVP 範圍

### 2.1 這一版要做的

### A. 使用者系統
- Email / Google 登入（二選一，MVP 建議先 Email magic link 或 demo account）
- 每位使用者有自己的私人資料空間

### B. Playlist / Group 管理
- 建立 playlist
- 編輯 playlist 名稱
- 刪除 playlist
- 將影片編號加入 playlist
- 調整排序

### C. Video Code 管理
- 手動輸入影片編號
- 系統標準化格式（例如自動轉大寫、去掉多餘空白）
- 顯示基本 metadata（先可手動補；第二階段再自動抓）

### D. 分享功能
- 匯出 `.txt`
- 複製 playlist 中的 code list
- 公開分享頁（read-only）

### E. Source 補全
- 使用者可設定自己偏好的站點模板
- 對 playlist 中每一筆影片編號，自動補成完整連結

例如：
- 偏好站 A：`https://sitea.com/search?q={code}`
- 偏好站 B：`https://siteb.com/video/{code}`

### F. 搜尋與篩選
- 搜尋自己的影片編號
- 搜尋 playlist 名稱

---

## 3. 這一版先不要做的

這些功能先刻意不做，避免 MVP 爆掉：

- 不做影片播放
- 不做下載或磁力連結
- 不做大量站點爬蟲
- 不做推薦系統
- 不做社交 feed
- 不做留言區
- 不做手機 App（先用 RWD 網頁）
- 不做太複雜的 metadata 自動同步

---

## 4. 目標使用者

### 第一批使用者

1. 會蒐集影片編號的人
2. 會自己整理清單、分享清單的人
3. 想快速保存與管理片單的人
4. 不想只靠瀏覽器書籤的人

### 使用情境

- 我想整理某位演員的片單
- 我想做「2025 Favorites」清單
- 我想把片單匯出給朋友
- 我想把文字清單一鍵補成我常用站點的連結

---

## 5. 使用者流程

## Flow 1：建立自己的 playlist

1. 註冊 / 登入
2. 建立 playlist（例如：`Best Story`）
3. 輸入多筆 video code
4. 儲存後在 playlist 中看到清單

## Flow 2：匯出與分享

1. 打開某個 playlist
2. 點選「匯出 TXT」或「複製清單」
3. 得到：

```txt
SSIS-123
IPX-920
ABP-777
```

4. 或點選「公開分享」產生連結

## Flow 3：自動補全來源網址

1. 使用者設定偏好來源模板
2. 在 playlist 頁面點選「用我的來源補全」
3. 系統輸出：

```txt
https://sitea.com/search?q=SSIS-123
https://sitea.com/search?q=IPX-920
https://sitea.com/search?q=ABP-777
```

---

## 6. 產品資訊架構

### 頁面清單

1. `/` Landing page
2. `/login` 登入頁
3. `/dashboard` 我的 playlists
4. `/playlist/[id]` playlist 詳細頁
5. `/settings/sources` 來源模板設定
6. `/share/[slug]` 公開分享頁

### 導覽結構

- Dashboard
- My Playlists
- Source Settings
- Shared Playlists
- Account

---

## 7. 功能詳細規格

## 7.1 Playlist

欄位：
- `name`
- `description`（可選）
- `is_public`
- `share_slug`
- `created_at`
- `updated_at`

操作：
- create
- rename
- delete
- toggle public
- reorder items

## 7.2 Playlist Item

欄位：
- `video_code`
- `normalized_code`
- `note`（可選）
- `position`
- `added_at`

### Code normalization 規則

輸入：
- `ssis123`
- `SSIS123`
- ` ssiS-123 `

系統儲存：
- `SSIS-123`

可先用簡單規則：
- 去空白
- 轉大寫
- 嘗試在英文字與數字間補 `-`

## 7.3 Source Templates

每位使用者可定義多個來源模板。

欄位：
- `name`
- `base_template`
- `is_default`

範例：
- `Site A` → `https://sitea.com/search?q={code}`
- `Site B` → `https://siteb.com/video/{code}`

功能：
- 新增模板
- 編輯模板
- 設定預設模板
- 測試預覽結果

## 7.4 Share

公開分享頁要做到：
- 可顯示 playlist 名稱
- 顯示 code list
- 可一鍵複製
- 若 viewer 自己有預設 source，可一鍵補全

---

## 8. 技術架構建議

## 8.1 前端

### 推薦技術
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query（可選）
- React Hook Form + Zod

### 原因
- 開發快
- UI 容易做乾淨
- 後續可直接部署到 Vercel
- 未來容易延伸成 SaaS

## 8.2 後端

### MVP 選項 A（最省事，推薦）
- Next.js Route Handlers / Server Actions
- Supabase Auth
- Supabase Postgres

### MVP 選項 B
- Next.js frontend
- Express / FastAPI backend
- PostgreSQL

### 建議
MVP 先用 **Supabase + Next.js**，開發速度最快。

## 8.3 資料庫

- PostgreSQL
- ORM：Prisma

---

## 9. Database Schema（MVP）

```sql
users (
  id uuid pk,
  email text unique,
  created_at timestamp
)

playlists (
  id uuid pk,
  user_id uuid fk -> users.id,
  name text,
  description text,
  is_public boolean default false,
  share_slug text unique,
  created_at timestamp,
  updated_at timestamp
)

playlist_items (
  id uuid pk,
  playlist_id uuid fk -> playlists.id,
  video_code text,
  normalized_code text,
  note text null,
  position int,
  created_at timestamp
)

source_templates (
  id uuid pk,
  user_id uuid fk -> users.id,
  name text,
  base_template text,
  is_default boolean default false,
  created_at timestamp
)
```

### 為什麼 MVP 不先拆 `videos` 表？

因為第一版重點是 **playlist manager**，不是完整 metadata database。  
所以先把 `video_code` 直接放在 `playlist_items`，可以加快開發。

### 第二階段再拆成：
- `videos`
- `video_metadata`
- `video_tags`
- `video_sources`

---

## 10. API 設計（MVP）

## Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Playlists
- `GET /api/playlists`
- `POST /api/playlists`
- `PATCH /api/playlists/:id`
- `DELETE /api/playlists/:id`
- `GET /api/playlists/:id`

## Playlist Items
- `POST /api/playlists/:id/items`
- `PATCH /api/playlists/:id/items/:itemId`
- `DELETE /api/playlists/:id/items/:itemId`
- `POST /api/playlists/:id/reorder`

## Source Templates
- `GET /api/sources`
- `POST /api/sources`
- `PATCH /api/sources/:id`
- `DELETE /api/sources/:id`

## Share
- `GET /api/share/:slug`

## Export
- `GET /api/playlists/:id/export.txt`
- `GET /api/playlists/:id/export.links`

---

## 11. 前端元件規劃

## Dashboard
- PlaylistCard
- CreatePlaylistDialog
- SearchBar

## Playlist Detail
- AddCodeInput
- BulkPasteTextarea
- PlaylistTable
- ExportButtons
- PublicToggle
- CopyAllButton
- GenerateLinksButton

## Source Settings
- SourceTemplateForm
- SourceTemplateList
- PreviewGeneratedLink

---

## 12. UI / UX 原則

1. **極簡**：像 playlist tool，不要像內容農場
2. **輸入快**：支援一次貼多行 code
3. **輸出快**：一鍵複製 / 匯出 / 補全
4. **可讀性高**：playlist 要像 Notion + Spotify 的中間感
5. **不要太重**：第一版盡量不放複雜圖片牆

---

## 13. 開發順序

## Phase 0：初始化
- 建立 Next.js 專案
- 接 Supabase
- 設定 Prisma
- 設定 Tailwind + shadcn/ui
- 建 DB schema

## Phase 1：基本功能
- 使用者登入
- Dashboard
- 建立 playlist
- Playlist 詳細頁
- 新增 / 刪除 item

## Phase 2：分享與匯出
- 匯出 txt
- 複製 code list
- 公開分享頁

## Phase 3：Source 補全
- Source settings 頁面
- 套用模板產生完整網址
- 匯出 links

---

## 14. 兩週開發計畫

## Week 1

### Day 1
- 初始化專案
- 設定 auth / database
- 建立基本 layout

### Day 2
- 建 playlists CRUD
- Dashboard UI

### Day 3
- Playlist detail page
- 手動新增單筆 code
- 刪除 item

### Day 4
- 支援 bulk paste
- code normalization
- 搜尋 playlist items

### Day 5
- 排序 / reorder
- 基本 polish

### Day 6
- 測試與修 bug
- 清理 schema / API

### Day 7
- 預留 buffer

## Week 2

### Day 8
- 匯出 txt
- 複製全部 code

### Day 9
- Public share 頁
- share slug

### Day 10
- Source template CRUD
- 預設來源邏輯

### Day 11
- 產生完整 links
- 匯出 links

### Day 12
- UI polish
- empty states
- loading states

### Day 13
- E2E 測試
- 修 bug

### Day 14
- 部署 Vercel
- Demo 資料
- README 補齊

---

## 15. 風險與注意事項

## 15.1 法律與平台風險

這個產品若涉及成人內容，必須非常小心。

### MVP 建議邊界
- 不存影片檔案
- 不提供播放
- 不提供下載連結
- 不提供磁力
- 不直接做盜版聚合
- 只做 user-generated code list / metadata / source template

### 產品定位建議
把產品定位成：

**playlist manager / code organizer / collection manager**

而不是影音站。

## 15.2 爬蟲風險

MVP 不建議立刻上爬蟲。  
先讓使用者自己輸入 code，之後再研究 metadata augmentation。

## 15.3 冷啟動問題

第一版不要做「社群首頁」。  
先讓每個人都能管理自己的清單，這樣即使沒有社群流量也有價值。

---

## 16. 後續版本路線圖

## V1.1
- 收藏夾封面
- playlist note
- code 重複檢查
- import txt

## V1.2
- metadata table
- actress / studio / tags
- cover image

## V1.3
- 公開探索頁
- 熱門公開 playlists
- 使用者 profile

## V2
- tag-based recommendation
- collaborative filtering
- 智慧搜尋
- 自動 metadata 補全

---

## 17. 成功指標（MVP）

### Product metrics
- 每位使用者建立的 playlist 數
- 每個 playlist 的平均 item 數
- 匯出功能使用次數
- 分享頁被打開次數
- Source link generation 次數

### Qualitative signals
- 使用者是否願意長期整理片單
- 使用者是否真的會分享片單
- 使用者是否覺得比書籤更好用

---

## 18. 建議的 MVP 定義

若你想把 MVP 壓到最精簡，真正最小版可以定義成：

### 必要功能
- 註冊 / 登入
- 建 playlist
- 新增多筆 video code
- 匯出 txt
- 設定一個 source template
- 一鍵產生補全連結
- 公開分享頁

只要這些都能穩定運作，這個產品就已經是一個完整 demo。

---

## 19. 建議技術棧總結

### 前端
- Next.js
- TypeScript
- Tailwind
- shadcn/ui

### 後端 / DB
- Supabase Auth
- Postgres
- Prisma

### 部署
- Vercel

### 開發策略
- 桌面版優先
- 手機先用 RWD
- 先本地整理，再逐步加入社群功能

---

## 20. 一句話總結

這個產品的 MVP 本質不是「內容平台」，而是：

> **一個以 video code 為核心的 playlist 管理、分享、與來源補全工具。**

如果 MVP 做得夠乾淨，它其實很適合先用極少功能快速上線測試。

