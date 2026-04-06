## Why

樂手進行視訊遠端教學時，市面上的通話工具（Zoom、Meet）會主動啟用回聲消除與噪音抑制，導致貝斯低頻（尤其是第四、五弦）嚴重失真，且 bitrate 壓縮使音色細節喪失。Bass-Lab 需要一個專為樂手設計的影音協作空間，能繞過瀏覽器預設的音訊處理、保留完整低頻細節，並在多人連線時維持極低延遲與完美影音同步。

## What Changes

- **新增後台管理系統**：管理員（super_admin）可透過 Rails 後台進行登入驗證、查看全部訂閱訂單、編輯與取消任意用戶訂閱、代用戶建立新訂閱；RBAC 簡化為 `super_admin` vs `user`，不啟用 `staff` 角色。用戶詳細頁顯示該用戶的好友列表（accepted friendships）與訂單列表，可直接點擊跳轉訂單管理，並提供「New Subscription」按鈕讓管理員直接為該用戶建立新訂閱。
- **新增訂閱制度**：新用戶享有 2 次免費試用（每次上限 5 分鐘）；訂閱月方案或年方案後解鎖完整通話功能；`orders` 表加 `period` enum（monthly/yearly）與 `expires_at` 欄位追蹤有效期；`users` 表加 `trial_sessions_used`（integer, default: 0）記錄試用消耗次數。
- **新增訂閱自助管理 API**：使用者可查看個人訂閱紀錄（`GET /api/subscriptions`）及取消訂閱（`DELETE /api/subscriptions/:id`，將 status 更新為 `cancelled`）。
- **新增 Google OAuth 登入**：使用者可透過 Google 帳號登入，省去密碼管理；以 `omniauth-google-oauth2` 整合 Devise omniauthable，`users` 表加 `provider` 與 `uid` 欄位。
- **新增二階段驗證（2FA）**：使用者可選擇性啟用 TOTP 二階段驗證（相容 Google Authenticator / Authy）；以 `devise-two-factor` 實作，`users` 表加 `otp_secret`、`otp_required_for_login`、`consumed_timestep` 欄位。
- **新增好友系統**：使用者可互相加好友、管理好友關係，並在好友列表查看即時上線狀態。
- **新增即時通知機制**：透過 ActionCable (Solid Cable) 推播「好友上線/離線」狀態更新與「視訊邀請」通知。
- **新增 Go 媒體伺服器**：以 Go + Pion 實作 WebRTC 信令交換與 SFU 媒體轉發，接收 RTP 封包後不解碼、直接轉發，確保最低處理延遲。
- **新增前端 SPA 路由**：以 `react-router-dom` 建立 React SPA 頁面路由結構；`App.tsx` 替換 Vite 預設範本，設定 `<BrowserRouter>` + `<Routes>`；各功能均為獨立可瀏覽頁面，路由對應：`/lobby`（通話大廳）、`/friends`（好友列表）、`/orders`（訂單紀錄）、`/profile`（個人資料）、`/call/:token`（通話頁）；每個頁面可直接透過瀏覽器 URL 存取，不再只是元件檔案。
- **新增前端 App Shell 與 Nav Bar**：使用 DaisyUI 為全站建立統一 Layout，含固定頂部 Nav Bar（好友目錄、訂單歷史、快速開啟視訊、個人資訊下拉）；支援 dark/light mode 切換，偏好儲存於 localStorage 並以 `data-theme` attribute 套用 DaisyUI 主題；樣式風格與 Rails 後台一致。
- **新增使用者前台帳號管理頁**：使用者可在 `/profile` 修改 `display_name`、變更密碼（驗證舊密碼）、申請修改 email（寄送驗證信）、管理 2FA 啟用/停用（含 QR Code 掃描流程）；所有操作對應 Rails API 端點。
- **新增使用者訂單歷史紀錄頁**：使用者可在 `/orders` 查看自己的訂閱訂單列表（含方案、金額、狀態、到期日）、免費試用剩餘次數、有效訂閱到期日，並可在線取消 confirmed 狀態訂單。
- **新增視訊通話大廳頁面**：`/lobby` 為 Zoom/Google Meet 風格的通話起點頁面；含本地相機預覽、麥克風/攝影機靜音切換、裝置選擇器（DeviceSelector）、好友在線狀態選取並發起通話；`/` 根路由重導至 `/lobby`。
- **新增裝置選擇器**：前端提供音訊/視訊輸入裝置選單，使用 `enumerateDevices()` 列舉所有裝置並支援以 `deviceId` 指定特定錄音介面通道。
- **新增音訊處理管線**：取得音訊串流後強制關閉 `echoCancellation`、`noiseSuppression`、`autoGainControl`；掛載 `GainNode`（放大 5 倍）與 `ChannelSplitter/Merger` 解決單聲道錄音介面輸入問題，確保雙聲道輸出均勻。
- **新增 SDP 優化**：Go 伺服器攔截並修改 SDP，強制音軌使用 Opus 128kbps 雙聲道（`useinbandfec=1;stereo=1;sprop-stereo=1;maxaveragebitrate=128000;minptime=10`）。

## Non-Goals

- 不包含 i18n 多語系支援（可另立 change 處理）
- 不包含錄音/錄影儲存功能（本次僅處理即時串流）
- 不包含行動裝置（iOS/Android App）支援，僅限桌面瀏覽器
- 不包含多房間/多人同時連線（本次 SFU 專注於一對一或小型 session）
- 不包含付款金流整合（訂閱管理含狀態 CRUD 與試用追蹤，但不含線上刷卡/付款）
- 不包含 CSV 資料匯入/匯出（需求不明確，待後續另立 change 定義）

## Capabilities

### New Capabilities

- `admin-panel`: 後台管理系統，含登入驗證、RBAC（super_admin only）、訂閱訂單查看與編輯/取消、代用戶建立新訂閱（從用戶詳細頁發起，user_id 預填且唯讀，status 預設 confirmed）
- `subscription-system`: 訂閱制度，含試用 2 次限制、月/年方案、到期追蹤、用戶自助取消、session 建立前的訂閱/試用資格檢查
- `friend-system`: 好友關係資料模型與 API，含好友邀請、接受/拒絕、解除好友操作
- `realtime-presence`: 以 ActionCable (Solid Cable) 實作的即時上線狀態廣播與視訊邀請推播通知
- `webrtc-media-server`: Go + Pion 媒體伺服器，負責 WebRTC 信令交換（offer/answer/ICE）、SDP 攔截修改與 RTP 封包直通轉發（SFU，不解碼）
- `frontend-routing`: React SPA 路由層，以 `react-router-dom` 建立 `<BrowserRouter>`，各功能頁面（大廳、好友列表、訂單、個人資料、通話頁）對應獨立 URL，可直接透過瀏覽器導覽
- `frontend-shell`: 全站 Layout 與 Nav Bar，使用 DaisyUI 套版；dark/light mode 切換（localStorage 持久化 + `data-theme` attribute）；Nav Bar 含好友、訂單、大廳、個人資訊下拉連結
- `user-profile`: 使用者自助帳號管理頁（`/profile`），含修改 display_name、變更密碼、申請修改 email（驗證信流程）、2FA 啟用/停用管理
- `user-orders`: 使用者前台訂單歷史紀錄頁（`/orders`），含訂閱列表、試用次數顯示、取消訂閱操作
- `call-lobby`: 視訊通話大廳頁面（`/lobby`），Zoom/Meet 風格；含本地相機預覽、裝置選擇、好友在線選取、發起通話入口
- `device-selector`: React 前端裝置選擇 UI，使用 `navigator.mediaDevices.enumerateDevices()` 列舉並允許選取特定 `deviceId`
- `audio-pipeline`: React 前端音訊前處理管線，包含停用瀏覽器 DSP 處理、`GainNode` 前級增益（5x）、`ChannelSplitter/Merger` 雙聲道處理
- `google-oauth`: 以 `omniauth-google-oauth2` 整合 Devise omniauthable，允許使用者透過 Google 帳號登入；`users` 表新增 `provider`、`uid` 欄位
- `two-factor-auth`: 以 `devise-two-factor` 實作 TOTP 二階段驗證（相容 Google Authenticator / Authy），使用者可選擇性啟用；`users` 表新增 `otp_secret`、`otp_required_for_login`、`consumed_timestep` 欄位

### Modified Capabilities

（無）

## Impact

- Affected specs: `admin-panel`, `subscription-system`, `friend-system`, `realtime-presence`, `webrtc-media-server`, `device-selector`, `audio-pipeline`, `google-oauth`, `two-factor-auth`, `frontend-shell`, `user-profile`, `user-orders`, `call-lobby`
- Affected code:
  - `app/models/` — User, Friendship, Order 模型
  - `app/controllers/admin/` — 後台管理控制器
  - `app/controllers/users/` — OmniauthCallbacksController（Google OAuth callback）
  - `app/channels/` — ActionCable channel（PresenceChannel, InvitationChannel）
  - `frontend/src/App.tsx` — React SPA 路由入口（BrowserRouter + Routes）
  - `frontend/src/pages/FriendsPage.tsx` — 好友列表頁（route: /friends）
  - `frontend/src/pages/CallPage.tsx` — 通話頁（route: /call/:token）
  - `frontend/src/components/DeviceSelector/` — 裝置選擇器元件
  - `frontend/src/hooks/useAudioPipeline.ts` — 音訊管線 hook
  - `frontend/package.json` — 新增 react-router-dom 依賴
  - `media-server/` — Go 媒體伺服器（獨立服務）
  - `media-server/signaling/` — WebRTC 信令處理
  - `media-server/sfu/` — SFU RTP 轉發邏輯
  - `media-server/sdp/` — SDP 修改邏輯
  - `app/controllers/api/subscriptions_controller.rb` — 用戶訂閱自助 API
  - `db/migrate/` — User（trial_sessions_used）、Friendship、Order（period, expires_at）相關 migration，以及 Google OAuth、2FA 欄位 migration
  - `config/cable.yml` — Solid Cable 設定
  - `config/initializers/devise.rb` — Devise OmniAuth 設定
  - `Gemfile` — 新增 `omniauth-google-oauth2`、`omniauth-rails_csrf_protection`、`devise-two-factor`、`rotp`、`rqrcode`
  - `frontend/src/components/Layout/AppLayout.tsx` — 全站 Layout + Nav Bar
  - `frontend/src/pages/LobbyPage.tsx` — 通話大廳（route: /lobby）
  - `frontend/src/pages/ProfilePage.tsx` — 個人資料管理（route: /profile）
  - `frontend/src/pages/OrdersPage.tsx` — 訂單歷史（route: /orders）
  - `app/controllers/api/profile_controller.rb` — 使用者帳號 API（display_name、密碼、email 修改）
  - `frontend/package.json` — 新增 daisyui 依賴
