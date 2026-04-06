## 1. 專案基礎建設

- [x] 1.1 建立 Rails 8 專案，設定 PostgreSQL 資料庫連線，安裝 Devise、administrate、cancancan、solid_cable gem
- [x] 1.2 建立 Go 模組 (`go.mod`) 與媒體伺服器目錄結構 (`media-server/{signaling,sfu,sdp}`)，安裝 `pion/webrtc/v3`
- [x] 1.3 建立 React SPA 入口（Vite + TypeScript），設定 ESLint、Tailwind CSS，確認 Hot Reload 正常運作
- [x] 1.4 新增 `Procfile.dev`，以 Foreman 同時啟動 Rails 與 Go 媒體伺服器，解決本地開發需同時啟動兩個服務的問題（呼應設計決策：Rails 與 Go 的通訊方式：HTTP REST，不共享資料庫）
- [x] 1.5 設定 `config/cable.yml` 以啟用 ActionCable transport via Solid Cable（PostgreSQL adapter），確認不需要 Redis 即可運作

- [x] 1.6 架構決策：取消獨立的 `admin_users` table，改在 `users` table 加 `role` 欄位（enum: `user/staff/super_admin`）統一管理所有使用者；Devise 與 Administrate 均以 `User` model 運作
- [x] 1.7 補全 `.gitignore`：加入 `log/`（Rails log 目錄不應進版控）

## 2. 資料庫 Migration

- [x] 2.1 建立 `users` table migration（含 `email`、`encrypted_password`、`display_name`、`avatar_url`、`role`），建立 User model（Devise + role enum）
- [x] 2.2 建立 `friendships` table migration，自關聯設計（`user_id`、`friend_id` 均指向 `users`，加 `status` enum、`requested_at`），建立複合唯一索引，建立 Friendship model
- [x] 2.3 取消獨立 `admin_users` table，role 統一在 `users` 管理（見 task 1.6）
- [x] 2.4 建立 `orders` table migration（含 `user_id`、`status` enum、`amount_cents`），建立 Order model
- [x] 2.5 實作 Subscription plans 資料模型（subscription-system spec）：建立 migration 新增訂閱相關欄位 — `orders` 加 `period` integer enum（0=monthly, 1=yearly）與 `expires_at` timestamp；`users` 加 `trial_sessions_used` integer（default: 0）；執行 `rails db:migrate`；更新 Order model 加入 `period` enum 與 `validates :expires_at, presence: true, if: :confirmed?`；更新 User model 加入 `trial_sessions_used` 欄位

## 3. 後台管理系統

- [x] 3.1 設定 Devise 與 Administrate gem，建立 Admin 登入路由 `/admin/sign_in`，實作 admin authentication：未驗證請求導向登入頁，驗證失敗顯示 "Invalid email or password"（呼應設計決策：後台管理系統：Administrate gem + Devise）
- [x] 3.2 實作 Role-based access control (RBAC)（admin-panel spec）：設定 cancancan `Ability` 類別，`super_admin` 可 `:manage, :all`；其他角色（user）無後台存取權；在 `Admin::ApplicationController` 中確認非 super_admin 請求返回 403
- [x] 3.3 建立 `AdminUsers` Administrate dashboard（`app/dashboards/admin_user_dashboard.rb`），僅 `super_admin` 可存取 `/admin/admin_users`：可將任意 user 的 role 升為 super_admin 或降回 user；在 `Admin::AdminUsersController` 中加 `before_action :require_super_admin!`，非 super_admin 請求返回 403
- [x] 3.4 實作 Order management 與 Admin subscription management（admin-panel spec、subscription-system spec）：建立 `Orders` Administrate dashboard（`app/dashboards/order_dashboard.rb`），顯示欄位含 `id`、`user_id`、`status`、`period`、`amount_cents`、`expires_at`、`created_at`；支援依 `status` 與 `created_at` 日期範圍篩選；`super_admin` 可編輯 `status`、`period`、`expires_at`（即取消或延長任意用戶訂閱）
- [x] 3.5 修正 `UserDashboard` 表單欄位（admin-panel spec）：移除自動生成的 `encrypted_password`、`orders`、`received_friendships`、`sent_friendships`、`remember_created_at`、`reset_password_sent_at`、`reset_password_token`；改用 Devise virtual attribute `password`、`password_confirmation`；`FORM_ATTRIBUTES = %i[email display_name role password password_confirmation]`；`Admin::UsersController#permitted_attributes` create 允許 `[:email, :display_name, :role, :password, :password_confirmation]`，update 只允許 `[:display_name, :role]`
- [x] 3.6 實作 User detail view with friends and orders（admin-panel spec）：在 `User` model 新增 `def accepted_friends` 返回雙向 accepted friendships 的對方 User 物件（`Friendship.where("(user_id = ? OR friend_id = ?) AND status = ?", id, id, :accepted).map { |f| f.user_id == id ? f.friend : f.user }`）；更新 `UserDashboard` ATTRIBUTE_TYPES 加入 `orders: Field::HasMany`、`accepted_friends: Field::HasMany`；更新 `SHOW_PAGE_ATTRIBUTES` 加入 `orders`、`accepted_friends`；更新 `COLLECTION_ATTRIBUTES` 加入顯示好友數的欄位（以 `accepted_friends` count 呈現）
- [x] 3.7 實作 Admin creates subscription for user（admin-panel spec）：（1）在 `UserDashboard` show 頁面覆寫 Administrate 部分視圖 `app/views/admin/users/_collection_header_actions.html.erb`，加入「New Subscription」按鈕，連結為 `new_admin_order_path(user_id: resource.id)`；（2）在 `Admin::OrdersController` 覆寫 `new` action：`@order = Order.new(user_id: params[:user_id], status: :confirmed)`；（3）在 `OrderDashboard` 新增 `NEW_PAGE_ATTRIBUTES = %i[user_id period amount_cents expires_at]`，`user_id` 使用 `Field::BelongsTo` 且於 new 表單中以 hidden field 送出、顯示為 read-only 文字；（4）`Order` model 已有 `validates :expires_at, presence: true, if: :confirmed?`，確認覆蓋新建路徑；（5）成功建立後 Administrate 預設 redirect 至 `/admin/orders/:id`

## 4. 好友系統 API

- [x] 4.1 建立 `Friendship` model（`belongs_to :user`, `belongs_to :friend, class_name: 'User'`），採用好友系統資料模型：自關聯 has_many :through 設計（`user_id` 與 `friend_id` 均指向 `users`，以 `status` 欄位區分方向，查詢時加 `OR` 條件）；加入 `status` enum 與驗證：禁止重複的 `pending/accepted` 關係，實作 friend request lifecycle
- [x] 4.2 實作 `POST /api/friends/requests`：建立 `pending` 好友邀請，已有 pending/accepted 紀錄時返回 HTTP 422 與 "Friend request already sent"
- [x] 4.3 實作 `POST /api/friends/requests/:id/accept` 與 `DELETE /api/friends/requests/:id`：接受邀請將 status 更新為 `accepted`；拒絕邀請刪除紀錄
- [x] 4.4 實作 `GET /api/friends`：返回 `status = accepted` 的好友列表（含 `user_id`, `display_name`, `avatar_url`），實作 friend list retrieval
- [x] 4.5 實作 `GET /api/friends/requests`：返回 incoming pending friend request list（`friend_id = 當前使用者`，含 `requester_id`, `display_name`, `avatar_url`, `requested_at`）
- [x] 4.6 實作 `DELETE /api/friends/:id`：刪除 `accepted` 好友關係（無論哪方發起），找不到時返回 HTTP 404 "Friendship not found"，實作 remove friend

## 5. 即時通知（ActionCable）

- [x] 5.1 建立 `PresenceChannel`，實作 online presence broadcast：訂閱時廣播 `{ user_id, status: "online" }` 給所有 accepted 好友，斷線時廣播 `{ user_id, status: "offline" }`（呼應設計決策：ActionCable 信令傳遞：只做通知，不做媒體協商）
- [x] 5.2 建立 `InvitationChannel`，實作訂閱機制，讓前端能接收發送給自己的視訊邀請推播
- [x] 5.3 實作 `POST /api/invitations`：驗證受邀者在線（已訂閱 PresenceChannel），生成 120 秒 TTL 的 `session_token`（JWT 或 SecureRandom），廣播 video call invitation push notification 至 InvitationChannel，返回 HTTP 201 與 `session_token`；受邀者離線時返回 HTTP 422 "User is not online"
- [x] 5.4 實作 `POST /api/invitations/:token/accept`：驗證 token 未過期返回 Go 伺服器 URL 與 token；token 已過期返回 HTTP 422 "Invitation expired"

## 6. Go 媒體伺服器

- [x] 6.1 實作 Go WebSocket 端點 `/ws/signal`，實作 WebRTC signaling over WebSocket：從 query param 取得 `session_token` 並向 Rails HTTP API 驗證（`GET /api/sessions/validate?token=...`）；無效 token 以 close code 4001 關閉連線（呼應設計決策：Rails 與 Go 的通訊方式：HTTP REST，不共享資料庫）
- [x] 6.2 實作 session 管理記憶體結構（`map[string]*Session`），含 session creation、第二 client 加入、第三 client 以 close code 4003 拒絕；實作 session management
- [x] 6.3 實作 ICE candidate 中繼：解析 `{ "type": "candidate", "candidate": "..." }` 訊息並轉發給對端
- [x] 6.4 實作 SDP offer/answer exchange 中繼：接收 offer/answer 並在 forwarding answer 前呼叫 SDP 修改邏輯；呼應設計決策：SDP 修改位置：Go 伺服器攔截，不在前端修改
- [x] 6.5 實作 `media-server/sdp/` 套件：解析 SDP 文字，強制 Opus `a=fmtp` 包含 `useinbandfec=1;stereo=1;sprop-stereo=1;maxaveragebitrate=128000;minptime=10`，移除非 VP8 的 video codec；實作 SDP offer/answer exchange 的修改邏輯
- [x] 6.6 實作 SFU RTP 直通轉發：`media-server/sfu/` 套件讀取 `pion/webrtc` 的 `OnTrack` 事件，直接將收到的 RTP 封包寫入對端的 `TrackLocalStaticRTP`，不解碼；實作 RTP forwarding (SFU passthrough) 呼應設計決策：SFU 架構：不轉碼，直通 RTP 封包
- [x] 6.7 實作 session 結束清理：任一端 WebSocket 或 RTP 連線關閉時，關閉雙方 `PeerConnection` 並從記憶體移除 session

## 7. 前端 - 裝置選擇器

- [x] 7.1 建立 `DeviceSelector` React 元件，在 mount 時呼叫 `navigator.mediaDevices.enumerateDevices()`，依 `audioinput`/`videoinput` kind 分別渲染兩個 `<select>` 下拉選單；label 為空時顯示 "Microphone N" / "Camera N"（1-based index），實作 enumerate available media devices
- [x] 7.2 監聽 `navigator.mediaDevices.addEventListener('devicechange', ...)` 與 `getUserMedia` 權限授予後自動重新呼叫 `enumerateDevices()` 刷新清單
- [x] 7.3 實作使用者選取後將 `selectedAudioDeviceId` 與 `selectedVideoDeviceId` 存入 state；呼叫 `getUserMedia` 時使用 `{ deviceId: { exact: ... } }`；`OverconstrainedError` 時顯示 "Selected device is no longer available. Please choose another."，實作 select specific audio input device by deviceId 與 select specific video input device by deviceId

## 8. 前端 - 音訊管線

- [x] 8.1 建立 `useAudioPipeline` hook，呼叫 `getUserMedia` 時設定 `echoCancellation: false, noiseSuppression: false, autoGainControl: false`；瀏覽器不支援時 `console.warn("DSP constraint not honored by browser")` 繼續執行，實作 disable browser DSP processing on getUserMedia
- [x] 8.2 在 hook 內建立 Web Audio API 處理圖（呼應設計決策：音訊管線：Web Audio API GainNode + ChannelSplitter/Merger）：`MediaStreamSourceNode → GainNode(gain=5) → ChannelSplitterNode(2) → [output[0]→merger input[0], output[0]→merger input[1]] → ChannelMergerNode(2) → MediaStreamDestinationNode`，實作 pre-amp gain via GainNode (5x)
- [x] 8.3 確認 `ChannelSplitterNode.output[0]`（左聲道）同時連至 `ChannelMergerNode.input[0]` 與 `input[1]`，實作 mono-to-stereo channel mapping via ChannelSplitter/Merger
- [x] 8.4 在 hook 的 cleanup 函數中呼叫 `audioContext.close()` 並對所有 track 呼叫 `.stop()`，實作 audio pipeline teardown on disconnect

## 9. 前端 - 路由設定與通話介面

- [x] 9.0 安裝 `react-router-dom`（`npm install react-router-dom`）；將 `frontend/src/App.tsx` 從 Vite 預設範本完全替換為 `<BrowserRouter>` + `<Routes>` 設定（SPA client-side routing）：`/` → 重導至 `/friends`、`/friends` → `<FriendsPage>`、`/call/:token` → `<CallPage>`；確認開啟 `http://localhost:5173/friends` 可見好友列表頁（非空白頁）
- [x] 9.1 將 `frontend/src/pages/FriendList.tsx`（若已存在則重命名為 `FriendsPage.tsx`）改造成完整可瀏覽的好友列表頁面（route: `/friends`）：頁面標題「Friends」、呼叫 `GET /api/friends` 顯示好友卡片列表（display_name、online badge）、訂閱 `PresenceChannel`，接收 `{ user_id, status }` 廣播後即時更新好友在線/離線狀態圖示；首次載入時呼叫 `GET /api/friends` 取得所有好友；每個好友卡片顯示 display_name 與綠/灰圓點表示在線狀態
- [x] 9.2 在 `FriendsPage` 訂閱 `InvitationChannel`，接收視訊邀請 `{ from_user_id, from_display_name, session_token }` 後顯示邀請彈窗（含接受/拒絕按鈕）；接受後呼叫 `POST /api/invitations/:token/accept` 取得 Go 伺服器 URL，以 `react-router-dom` 的 `useNavigate` 導向 `/call/:token`；拒絕則關閉彈窗
- [x] 9.3 在 `FriendsPage` 為每個在線好友卡片加入「發起通話」按鈕：點擊後呼叫 `POST /api/invitations`（body: `{ invitee_id }`），取得 `session_token` 後顯示「等待對方接受…」狀態（可含取消按鈕）；超過 120 秒未接受或使用者取消時清除等待狀態並顯示「邀請已過期」；成功對方接受後，前端透過 `InvitationChannel` 收到接受訊息，以 `useNavigate` 導向 `/call/:token`
- [x] 9.4 建立 `frontend/src/pages/CallPage.tsx` 作為完整可瀏覽的通話頁面（route: `/call/:token`）：從 URL param 取得 `token`，呼叫 `POST /api/invitations/:token/accept` 取得 Go 伺服器 WebSocket URL；使用 `useAudioPipeline` 取得處理後的音訊 track，建立 `RTCPeerConnection` 連線 Go 伺服器，透過 WebSocket 交換 offer/answer/ICE candidate，完成影音連線；頁面顯示連線狀態（Connecting… / Connected / Disconnected）、本地與遠端 `<video>` 元素、以及結束通話按鈕
- [x] 9.5 在 `CallPage` 嵌入 `DeviceSelector` 元件，允許使用者在通話前選擇音訊/視訊裝置；點擊結束通話按鈕時呼叫 audio pipeline teardown（`useAudioPipeline` cleanup）並關閉 `RTCPeerConnection`，之後以 `useNavigate` 導回 `/friends`

## 10. Google OAuth 登入

- [x] 10.1 實作 Google OAuth login（google-oauth spec）：在 `Gemfile` 新增 `omniauth-google-oauth2`、`omniauth-rails_csrf_protection` 並執行 `bundle install`；在 `config/initializers/devise.rb` 加入 `config.omniauth :google_oauth2, ENV["GOOGLE_CLIENT_ID"], ENV["GOOGLE_CLIENT_SECRET"]`
- [x] 10.2 建立 `db/migrate` 新增 `users.provider`（string）與 `users.uid`（string）欄位的 migration，執行 `rails db:migrate`；在 `User` model 加入 `devise :omniauthable, omniauth_providers: [:google_oauth2]`
- [x] 10.3 建立 `app/controllers/users/omniauth_callbacks_controller.rb`：實作 `google_oauth2` action，以 `provider` + `uid` 查找既有使用者；不存在則以 Google 資料（email, name）建立新使用者（`display_name` 取自 `info.name`，`password` 以 `Devise.friendly_token` 填入）；sign_in 後導向 root；建立失敗導向 `new_user_registration_url`
- [x] 10.4 在 `config/routes.rb` 設定 `devise_for :users, controllers: { omniauth_callbacks: "users/omniauth_callbacks" }`；確認 `GET /users/auth/google_oauth2` 與 `GET /users/auth/google_oauth2/callback` 路由存在
- [x] 10.5 實作 email 衝突合併邏輯：若 Google OAuth 返回的 email 已對應到 `provider` 為 nil 的使用者，則更新該使用者的 `provider` 與 `uid` 並 sign_in，不建立重複帳號

## 11. 二階段驗證（2FA）

- [x] 11.1 實作 TOTP two-factor authentication（two-factor-auth spec）：在 `Gemfile` 新增 `devise-two-factor`、`rotp`、`rqrcode` 並執行 `bundle install`；執行 `rails generate devise_two_factor User`，確認生成的 migration 包含 `otp_secret`（encrypted_attribute）、`otp_required_for_login`（boolean, default: false）、`consumed_timestep`（integer）欄位
- [x] 11.2 更新 `User` model：加入 `devise :two_factor_authenticatable, otp_secret_encryption_key: ENV["OTP_SECRET_ENCRYPTION_KEY"]`；加入 `has_one_time_password(backup_codes: false)`；確認 `Devise` 的 `:two_factor_backupable` **不**啟用（本次 Non-Goal）
- [x] 11.3 建立 `app/controllers/users/two_factor_controller.rb`：`GET /users/two_factor/setup` — 若尚未啟用 2FA，呼叫 `current_user.generate_totp_secret` 並暫存於 session，以 `rqrcode` 產生 QR Code SVG 回傳給前端；`POST /users/two_factor/enable` — 從 session 取出暫存 secret，以 `current_user.validate_and_consume_otp!(params[:otp_attempt])` 驗證；成功則儲存 `otp_secret`、設定 `otp_required_for_login = true`；失敗則回傳 422 + `{ error: "Invalid verification code" }`
- [x] 11.4 建立 `app/controllers/users/two_factor_controller.rb#disable` action：`DELETE /users/two_factor` — 驗證使用者已登入，設定 `otp_required_for_login = false`、清空 `otp_secret`，回傳 200
- [x] 11.5 覆寫 Devise `SessionsController`（`app/controllers/users/sessions_controller.rb`）：在 `create` action 中，主要憑證驗證通過後，若使用者 `otp_required_for_login?`，則不立即 sign_in，改為將 `user_id` 存入 session 並 redirect 至 2FA 驗證頁；建立 `POST /users/sessions/verify_otp` action — 從 session 取出 `user_id`，呼叫 `user.validate_and_consume_otp!(params[:otp_attempt])`；成功則 sign_in 並導向 root；失敗則回傳 422 + `{ error: "Invalid two-factor code" }`

## 12. 訂閱系統

- [x] 12.1 實作 Trial session allowance 與 Subscription plans 資格檢查（subscription-system spec）：在 `POST /api/invitations` 的 controller 中，呼叫 helper `User#session_eligible?`；該 method 返回 `true` 的條件：`orders.where(status: :confirmed).where("expires_at > ?", Time.current).exists?` 或 `trial_sessions_used < 2`；不符合時返回 HTTP 403 + `{ error: "No active subscription. Please subscribe to continue." }`
- [x] 12.2 實作試用計次遞增：session 結束時（Go 伺服器呼叫 Rails `DELETE /api/sessions/:token`），若該 session 屬於試用（發起者無 active subscription），則對發起者 user 執行 `increment!(:trial_sessions_used)`；Rails 端建立 `DELETE /api/sessions/:token` endpoint，驗證 token 有效後執行清理邏輯
- [x] 12.3 實作試用 5 分鐘強制結束：Go 伺服器在 session 建立時，若 Rails 驗證回應包含 `"trial": true`，則啟動 300 秒 timer；時間到時以 close code 4004 關閉雙方 WebSocket 連線；Rails `GET /api/sessions/validate?token=...` 的回應格式為 `{ valid: true, session_id: "...", trial: true|false }`
- [x] 12.4 實作 User subscription self-service（subscription-system spec）：建立 `app/controllers/api/subscriptions_controller.rb`；`GET /api/subscriptions` — 返回 `current_user.orders.order(created_at: :desc)` 序列化為 `[{ id, status, period, amount_cents, expires_at, created_at }]`，HTTP 200；`DELETE /api/subscriptions/:id` — 查找 `current_user.orders.find(params[:id])`，找不到返回 404，找到則 `order.update!(status: :cancelled)` 返回 HTTP 200 + `{ message: "Subscription cancelled." }`；在 `config/routes.rb` 加入 `namespace :api { resources :subscriptions, only: [:index, :destroy] }`

## 13. 前端 Shell - Layout & Nav Bar

- [x] 13.1 安裝 DaisyUI（`npm install daisyui`）並在 `frontend/vite.config.ts` 的 Tailwind 設定中加入 DaisyUI plugin；確認 `data-theme="light"` 與 `data-theme="dark"` 可套用 DaisyUI 內建主題樣式（App shell 套版）
- [x] 13.2 建立 `frontend/src/components/Layout/AppLayout.tsx`（App Shell with persistent Nav Bar）：頁面頂端固定 Nav Bar，右側包含導覽連結（好友 `/friends`、訂單 `/orders`）、「快速通話」按鈕（→ `/lobby`）、dark/light toggle 按鈕（sun/moon icon）、使用者 display_name 下拉選單（含「個人資料」→ `/profile`、「登出」→ `DELETE /users/sign_out`）；Nav Bar 下方為 `<Outlet>` 內容區
- [x] 13.3 實作 Dark/light mode toggle：頁面初始化時讀取 `localStorage["theme"]`，預設為 `"light"`；設定 `document.documentElement.setAttribute("data-theme", theme)`；toggle 按鈕點擊後切換 theme、更新 `localStorage["theme"]`、更新按鈕 icon（light 模式顯示月亮、dark 模式顯示太陽）
- [x] 13.4 更新 `frontend/src/App.tsx` 路由結構：`/`、`/lobby`、`/friends`、`/orders`、`/profile` 使用 nested route 包在 `<AppLayout>` 下（以 `<Outlet>` 渲染子頁面）；`/call/:token` 不套 AppLayout（全螢幕通話頁）；`/` 重導至 `/lobby`（取代原先重導至 `/friends`）
- [x] 13.5 從 `GET /api/profile` 取得當前使用者的 `display_name`，在 Nav Bar 下拉選單中顯示；登出按鈕觸發 `DELETE /users/sign_out` 並重導至 `/users/sign_in`

## 14. 使用者前台 - 個人資料頁

- [x] 14.1 建立 Rails API `GET /api/profile`（`Api::ProfileController#show`）：返回 `{ display_name, email, trial_sessions_used, otp_required_for_login }`（User profile management page 所需資料）；建立 `PATCH /api/profile`（`#update`，Display name update）：只允許更新 `display_name`，成功返回 200 + 更新後 user JSON，驗證失敗返回 422 + `{ errors }`；在 `config/routes.rb` 的 `namespace :api` 加入 `resource :profile, only: [:show, :update]`
- [x] 14.2 建立 Rails API `POST /api/profile/password`：以 `resource.valid_password?(params[:current_password])` 驗證舊密碼，失敗返回 422 + `{ error: "Current password is incorrect" }`；成功則 `resource.update!(password: params[:new_password])` 返回 HTTP 200；在 routes 加入 `resource :profile` 的 `member { post :password }`
- [x] 14.3 建立 Rails API `PATCH /api/profile/email`：驗證新 email 格式，呼叫 `resource.update!(email: params[:email])`（Devise confirmable 會自動寄送驗證信至新信箱），返回 HTTP 200 + `{ message: "Confirmation email sent. Please check your new inbox." }`；格式驗證失敗返回 422 + `{ errors }`；在 routes 加入 `member { patch :email }`
- [x] 14.4 建立 `frontend/src/pages/ProfilePage.tsx`（route: `/profile`，User profile management page）：呼叫 `GET /api/profile` 取得初始資料；提供三個獨立 section：（1）display_name 行內編輯（`PATCH /api/profile`，Display name update）；（2）密碼修改表單（current_password + new_password + confirm，`POST /api/profile/password`，password change）；（3）email 修改（`PATCH /api/profile/email`，email change with verification）；各 section 獨立顯示成功/錯誤訊息
- [x] 14.5 在 ProfilePage 加入 2FA 管理 section（2FA management on profile page）：呼叫 `GET /api/profile` 取得 `otp_required_for_login`；未啟用時顯示「啟用 2FA」按鈕 → 點擊呼叫 `GET /users/two_factor/setup` → 顯示 QR Code SVG + OTP 輸入框 → 提交 `POST /users/two_factor/enable`；已啟用時顯示「停用 2FA」按鈕 → 點擊 `DELETE /users/two_factor`；操作結果即時更新顯示狀態

## 15. 使用者前台 - 訂單歷史紀錄頁

- [x] 15.1 建立 `frontend/src/pages/OrdersPage.tsx`（route: `/orders`）：呼叫 `GET /api/subscriptions` 取得訂單列表（user order history page）；以表格或卡片列表顯示每筆訂單欄位：id、period（Monthly/Yearly）、amount_cents（格式化為 NT$XX,XXX）、status（confirmed/cancelled）、expires_at（YYYY-MM-DD）、created_at（YYYY-MM-DD）；空列表顯示「目前沒有訂閱紀錄」
- [x] 15.2 在 OrdersPage 頂端顯示訂閱狀態摘要（subscription and trial status summary）：呼叫 `GET /api/profile` 取得 `trial_sessions_used`；若有 `status === "confirmed"` 且 `expires_at > now` 的訂單顯示「訂閱中：有效至 YYYY-MM-DD」（取 expires_at 最大值）；否則顯示「目前無有效訂閱」；固定顯示「免費試用：已使用 N / 2 次」
- [x] 15.3 實作取消訂閱功能（cancel subscription）：`confirmed` 狀態訂單顯示「取消訂閱」按鈕；點擊後顯示 DaisyUI confirm dialog「確定要取消此訂閱嗎？取消後無法復原。」；確認後呼叫 `DELETE /api/subscriptions/:id`；成功後該筆訂單 status 即時更新為 `cancelled` 並移除按鈕；失敗時顯示 alert 錯誤訊息

## 16. 視訊通話大廳

- [x] 16.1 建立 `frontend/src/pages/LobbyPage.tsx`（route: `/lobby`，Call lobby page）：mount 時呼叫 `getUserMedia({ audio: true, video: true })` 取得本地預覽 stream；將 stream 綁定至 muted `<video>` 元素顯示本地預覽；提供麥克風靜音切換按鈕（切換 `audioTrack.enabled`）與攝影機靜音切換按鈕（切換 `videoTrack.enabled`）；unmount 時對所有 track 呼叫 `.stop()`（Lobby camera preview teardown）
- [x] 16.2 在 LobbyPage 整合 DeviceSelector 元件（lobby 裝置選擇）：使用者選擇新裝置後，停止舊 stream 並重新呼叫 `getUserMedia` 套用新 `deviceId`，更新本地預覽；使用 `useAudioPipeline` hook 取得處理後的 audio stream 供後續通話使用
- [x] 16.3 在 LobbyPage 顯示好友在線列表（friend selection and call initiation from lobby）：呼叫 `GET /api/friends` 取得好友列表，訂閱 `PresenceChannel` 維護即時在線狀態；在線好友（綠點）顯示「通話」按鈕；離線好友列於下方灰色區域不顯示通話按鈕；點擊「通話」後呼叫 `POST /api/invitations`，顯示「等待 {display_name} 接受通話…」+ 取消按鈕；120 秒逾時自動顯示「邀請已過期」；`InvitationChannel` 收到 `{ accepted: true, session_token }` 後 `useNavigate('/call/:token')`
