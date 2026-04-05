## 1. 專案基礎建設

- [x] 1.1 建立 Rails 8 專案，設定 PostgreSQL 資料庫連線，安裝 Devise、administrate、cancancan、solid_cable gem
- [x] 1.2 建立 Go 模組 (`go.mod`) 與媒體伺服器目錄結構 (`media-server/{signaling,sfu,sdp}`)，安裝 `pion/webrtc/v3`
- [x] 1.3 建立 React SPA 入口（Vite + TypeScript），設定 ESLint、Tailwind CSS，確認 Hot Reload 正常運作
- [x] 1.4 新增 `Procfile.dev`，以 Foreman 同時啟動 Rails 與 Go 媒體伺服器，解決本地開發需同時啟動兩個服務的問題（呼應設計決策：Rails 與 Go 的通訊方式：HTTP REST，不共享資料庫）
- [x] 1.5 設定 `config/cable.yml` 以啟用 ActionCable transport via Solid Cable（PostgreSQL adapter），確認不需要 Redis 即可運作

- [x] 1.6 架構決策：取消獨立的 `admin_users` table，改在 `users` table 加 `role` 欄位（enum: `user/staff/super_admin`）統一管理所有使用者；Devise 與 Administrate 均以 `User` model 運作

## 2. 資料庫 Migration

- [x] 2.1 建立 `users` table migration（含 `email`、`encrypted_password`、`display_name`、`avatar_url`、`role`），建立 User model（Devise + role enum）
- [x] 2.2 建立 `friendships` table migration，自關聯設計（`user_id`、`friend_id` 均指向 `users`，加 `status` enum、`requested_at`），建立複合唯一索引，建立 Friendship model
- [x] 2.3 取消獨立 `admin_users` table，role 統一在 `users` 管理（見 task 1.6）
- [x] 2.4 建立 `orders` table migration（含 `user_id`、`status` enum、`amount_cents`），建立 Order model

## 3. 後台管理系統

- [x] 3.1 設定 Devise 與 Administrate gem，建立 Admin 登入路由 `/admin/sign_in`，實作 admin authentication：未驗證請求導向登入頁，驗證失敗顯示 "Invalid email or password"（呼應設計決策：後台管理系統：Administrate gem + Devise）
- [ ] 3.2 設定 cancancan `Ability` 類別，實作 role-based access control (RBAC)：`super_admin` 有完整存取權，`staff` 對 orders/users 只讀，`staff` 存取 `/admin/admin_users` 返回 403
- [ ] 3.3 建立 `AdminUsers` Administrate dashboard，實作 `super_admin` 可新增/編輯/刪除管理員帳號
- [ ] 3.4 建立 `Orders` Administrate dashboard，實作 order management：依 `status` 與 `created_at` 日期範圍篩選，`super_admin` 可編輯 `status`，`staff` 只讀

## 4. 好友系統 API

- [ ] 4.1 建立 `Friendship` model（`belongs_to :user`, `belongs_to :friend, class_name: 'User'`），採用好友系統資料模型：自關聯 has_many :through 設計（`user_id` 與 `friend_id` 均指向 `users`，以 `status` 欄位區分方向，查詢時加 `OR` 條件）；加入 `status` enum 與驗證：禁止重複的 `pending/accepted` 關係，實作 friend request lifecycle
- [ ] 4.2 實作 `POST /api/friends/requests`：建立 `pending` 好友邀請，已有 pending/accepted 紀錄時返回 HTTP 422 與 "Friend request already sent"
- [ ] 4.3 實作 `POST /api/friends/requests/:id/accept` 與 `DELETE /api/friends/requests/:id`：接受邀請將 status 更新為 `accepted`；拒絕邀請刪除紀錄
- [ ] 4.4 實作 `GET /api/friends`：返回 `status = accepted` 的好友列表（含 `user_id`, `display_name`, `avatar_url`），實作 friend list retrieval
- [ ] 4.5 實作 `GET /api/friends/requests`：返回 incoming pending friend request list（`friend_id = 當前使用者`，含 `requester_id`, `display_name`, `avatar_url`, `requested_at`）
- [ ] 4.6 實作 `DELETE /api/friends/:id`：刪除 `accepted` 好友關係（無論哪方發起），找不到時返回 HTTP 404 "Friendship not found"，實作 remove friend

## 5. 即時通知（ActionCable）

- [ ] 5.1 建立 `PresenceChannel`，實作 online presence broadcast：訂閱時廣播 `{ user_id, status: "online" }` 給所有 accepted 好友，斷線時廣播 `{ user_id, status: "offline" }`（呼應設計決策：ActionCable 信令傳遞：只做通知，不做媒體協商）
- [ ] 5.2 建立 `InvitationChannel`，實作訂閱機制，讓前端能接收發送給自己的視訊邀請推播
- [ ] 5.3 實作 `POST /api/invitations`：驗證受邀者在線（已訂閱 PresenceChannel），生成 120 秒 TTL 的 `session_token`（JWT 或 SecureRandom），廣播 video call invitation push notification 至 InvitationChannel，返回 HTTP 201 與 `session_token`；受邀者離線時返回 HTTP 422 "User is not online"
- [ ] 5.4 實作 `POST /api/invitations/:token/accept`：驗證 token 未過期返回 Go 伺服器 URL 與 token；token 已過期返回 HTTP 422 "Invitation expired"

## 6. Go 媒體伺服器

- [ ] 6.1 實作 Go WebSocket 端點 `/ws/signal`，實作 WebRTC signaling over WebSocket：從 query param 取得 `session_token` 並向 Rails HTTP API 驗證（`GET /api/sessions/validate?token=...`）；無效 token 以 close code 4001 關閉連線（呼應設計決策：Rails 與 Go 的通訊方式：HTTP REST，不共享資料庫）
- [ ] 6.2 實作 session 管理記憶體結構（`map[string]*Session`），含 session creation、第二 client 加入、第三 client 以 close code 4003 拒絕；實作 session management
- [ ] 6.3 實作 ICE candidate 中繼：解析 `{ "type": "candidate", "candidate": "..." }` 訊息並轉發給對端
- [ ] 6.4 實作 SDP offer/answer exchange 中繼：接收 offer/answer 並在 forwarding answer 前呼叫 SDP 修改邏輯；呼應設計決策：SDP 修改位置：Go 伺服器攔截，不在前端修改
- [ ] 6.5 實作 `media-server/sdp/` 套件：解析 SDP 文字，強制 Opus `a=fmtp` 包含 `useinbandfec=1;stereo=1;sprop-stereo=1;maxaveragebitrate=128000;minptime=10`，移除非 VP8 的 video codec；實作 SDP offer/answer exchange 的修改邏輯
- [ ] 6.6 實作 SFU RTP 直通轉發：`media-server/sfu/` 套件讀取 `pion/webrtc` 的 `OnTrack` 事件，直接將收到的 RTP 封包寫入對端的 `TrackLocalStaticRTP`，不解碼；實作 RTP forwarding (SFU passthrough) 呼應設計決策：SFU 架構：不轉碼，直通 RTP 封包
- [ ] 6.7 實作 session 結束清理：任一端 WebSocket 或 RTP 連線關閉時，關閉雙方 `PeerConnection` 並從記憶體移除 session

## 7. 前端 - 裝置選擇器

- [ ] 7.1 建立 `DeviceSelector` React 元件，在 mount 時呼叫 `navigator.mediaDevices.enumerateDevices()`，依 `audioinput`/`videoinput` kind 分別渲染兩個 `<select>` 下拉選單；label 為空時顯示 "Microphone N" / "Camera N"（1-based index），實作 enumerate available media devices
- [ ] 7.2 監聽 `navigator.mediaDevices.addEventListener('devicechange', ...)` 與 `getUserMedia` 權限授予後自動重新呼叫 `enumerateDevices()` 刷新清單
- [ ] 7.3 實作使用者選取後將 `selectedAudioDeviceId` 與 `selectedVideoDeviceId` 存入 state；呼叫 `getUserMedia` 時使用 `{ deviceId: { exact: ... } }`；`OverconstrainedError` 時顯示 "Selected device is no longer available. Please choose another."，實作 select specific audio input device by deviceId 與 select specific video input device by deviceId

## 8. 前端 - 音訊管線

- [ ] 8.1 建立 `useAudioPipeline` hook，呼叫 `getUserMedia` 時設定 `echoCancellation: false, noiseSuppression: false, autoGainControl: false`；瀏覽器不支援時 `console.warn("DSP constraint not honored by browser")` 繼續執行，實作 disable browser DSP processing on getUserMedia
- [ ] 8.2 在 hook 內建立 Web Audio API 處理圖（呼應設計決策：音訊管線：Web Audio API GainNode + ChannelSplitter/Merger）：`MediaStreamSourceNode → GainNode(gain=5) → ChannelSplitterNode(2) → [output[0]→merger input[0], output[0]→merger input[1]] → ChannelMergerNode(2) → MediaStreamDestinationNode`，實作 pre-amp gain via GainNode (5x)
- [ ] 8.3 確認 `ChannelSplitterNode.output[0]`（左聲道）同時連至 `ChannelMergerNode.input[0]` 與 `input[1]`，實作 mono-to-stereo channel mapping via ChannelSplitter/Merger
- [ ] 8.4 在 hook 的 cleanup 函數中呼叫 `audioContext.close()` 並對所有 track 呼叫 `.stop()`，實作 audio pipeline teardown on disconnect

## 9. 前端 - 通話介面

- [ ] 9.1 建立好友列表頁面，訂閱 `PresenceChannel`，接收 `{ user_id, status }` 廣播後即時更新好友在線/離線狀態圖示
- [ ] 9.2 訂閱 `InvitationChannel`，接收視訊邀請 `{ from_user_id, from_display_name, session_token }` 後顯示邀請彈窗（接受/拒絕）
- [ ] 9.3 實作「發起通話」流程：呼叫 `POST /api/invitations`，取得 `session_token` 後開始等待對方接受，超過 120 秒未接受時顯示「邀請已過期」
- [ ] 9.4 實作通話頁面：接受邀請後呼叫 `POST /api/invitations/:token/accept` 取得 Go 伺服器 URL，使用 `useAudioPipeline` 取得處理後的音訊 track，建立 `RTCPeerConnection` 連線 Go 伺服器，傳送 offer、接收 answer，完成影音連線
- [ ] 9.5 在通話頁面嵌入 `DeviceSelector`，允許使用者在通話前選擇裝置；通話結束時觸發 audio pipeline teardown

## 10. Google OAuth 登入

- [ ] 10.1 實作 Google OAuth login（google-oauth spec）：在 `Gemfile` 新增 `omniauth-google-oauth2`、`omniauth-rails_csrf_protection` 並執行 `bundle install`；在 `config/initializers/devise.rb` 加入 `config.omniauth :google_oauth2, ENV["GOOGLE_CLIENT_ID"], ENV["GOOGLE_CLIENT_SECRET"]`
- [ ] 10.2 建立 `db/migrate` 新增 `users.provider`（string）與 `users.uid`（string）欄位的 migration，執行 `rails db:migrate`；在 `User` model 加入 `devise :omniauthable, omniauth_providers: [:google_oauth2]`
- [ ] 10.3 建立 `app/controllers/users/omniauth_callbacks_controller.rb`：實作 `google_oauth2` action，以 `provider` + `uid` 查找既有使用者；不存在則以 Google 資料（email, name）建立新使用者（`display_name` 取自 `info.name`，`password` 以 `Devise.friendly_token` 填入）；sign_in 後導向 root；建立失敗導向 `new_user_registration_url`
- [ ] 10.4 在 `config/routes.rb` 設定 `devise_for :users, controllers: { omniauth_callbacks: "users/omniauth_callbacks" }`；確認 `GET /users/auth/google_oauth2` 與 `GET /users/auth/google_oauth2/callback` 路由存在
- [ ] 10.5 實作 email 衝突合併邏輯：若 Google OAuth 返回的 email 已對應到 `provider` 為 nil 的使用者，則更新該使用者的 `provider` 與 `uid` 並 sign_in，不建立重複帳號

## 11. 二階段驗證（2FA）

- [ ] 11.1 實作 TOTP two-factor authentication（two-factor-auth spec）：在 `Gemfile` 新增 `devise-two-factor`、`rotp`、`rqrcode` 並執行 `bundle install`；執行 `rails generate devise_two_factor User`，確認生成的 migration 包含 `otp_secret`（encrypted_attribute）、`otp_required_for_login`（boolean, default: false）、`consumed_timestep`（integer）欄位
- [ ] 11.2 更新 `User` model：加入 `devise :two_factor_authenticatable, otp_secret_encryption_key: ENV["OTP_SECRET_ENCRYPTION_KEY"]`；加入 `has_one_time_password(backup_codes: false)`；確認 `Devise` 的 `:two_factor_backupable` **不**啟用（本次 Non-Goal）
- [ ] 11.3 建立 `app/controllers/users/two_factor_controller.rb`：`GET /users/two_factor/setup` — 若尚未啟用 2FA，呼叫 `current_user.generate_totp_secret` 並暫存於 session，以 `rqrcode` 產生 QR Code SVG 回傳給前端；`POST /users/two_factor/enable` — 從 session 取出暫存 secret，以 `current_user.validate_and_consume_otp!(params[:otp_attempt])` 驗證；成功則儲存 `otp_secret`、設定 `otp_required_for_login = true`；失敗則回傳 422 + `{ error: "Invalid verification code" }`
- [ ] 11.4 建立 `app/controllers/users/two_factor_controller.rb#disable` action：`DELETE /users/two_factor` — 驗證使用者已登入，設定 `otp_required_for_login = false`、清空 `otp_secret`，回傳 200
- [ ] 11.5 覆寫 Devise `SessionsController`（`app/controllers/users/sessions_controller.rb`）：在 `create` action 中，主要憑證驗證通過後，若使用者 `otp_required_for_login?`，則不立即 sign_in，改為將 `user_id` 存入 session 並 redirect 至 2FA 驗證頁；建立 `POST /users/sessions/verify_otp` action — 從 session 取出 `user_id`，呼叫 `user.validate_and_consume_otp!(params[:otp_attempt])`；成功則 sign_in 並導向 root；失敗則回傳 422 + `{ error: "Invalid two-factor code" }`
