## Context

Bass-Lab 是一個三層式架構的應用程式：
- **Rails 8 後端**：處理業務邏輯、使用者管理、好友系統、訂單管理，並透過 ActionCable (Solid Cable) 提供即時訊息推播。
- **Go 媒體伺服器**（獨立服務）：使用 Pion WebRTC 函式庫處理 WebRTC 信令與 SFU 媒體轉發，與 Rails 後端分離部署。
- **React SPA 前端**：透過 Inertia.js 或獨立 SPA 掛載在 Rails 上，負責 UI 互動、裝置選擇及 Web Audio API 音訊前處理。

目前專案尚無任何既有程式碼，為全新開發。Go 媒體伺服器以獨立 binary 運行，不依賴 Rails 進程。

## Goals / Non-Goals

**Goals:**

- 建立可運作的 WebRTC 一對一視訊通話流程（含信令 → 連線 → 媒體轉發）
- 保留貝斯低頻細節（停用瀏覽器 DSP、強制 Opus 128kbps 雙聲道）
- 提供後台管理系統供管理員使用
- 實作好友系統與即時上線狀態

**Non-Goals:**

- 多房間/多人同時連線（超過 2 人的 session 架構）
- 錄音/錄影儲存
- 行動裝置 App
- 付款金流
- i18n 多語系

## Decisions

### Rails 與 Go 的通訊方式：HTTP REST，不共享資料庫

Rails 後端透過 HTTP API 與 Go 媒體伺服器溝通（建立 session、驗證 token），兩者不共享 PostgreSQL。

**為何不用共享資料庫或 gRPC**：HTTP REST 部署最簡單，且媒體伺服器的 session 狀態為短暫記憶體狀態（不需持久化），無需共用資料庫；gRPC 對此規模過度複雜。

### ActionCable 信令傳遞：只做通知，不做媒體協商

ActionCable (Solid Cable) 負責推播「視訊邀請」與「上線狀態」，WebRTC 的 offer/answer/ICE candidate 直接透過 React ↔ Go WebSocket 進行，不經 Rails。

**為何 Rails 不代理 WebRTC 信令**：Rails 的 ActionCable 適合推播輕量通知，但 WebRTC 信令需要低延遲雙向通訊且訊息量大；Go 媒體伺服器直接建立 WebSocket 端點（`/ws/signal`）更有效率，也避免 Rails 成為信令瓶頸。

### SFU 架構：不轉碼，直通 RTP 封包

Go 伺服器收到 RTP 封包後不解碼，直接將音訊（Opus）與視訊（VP8/H.264）封包轉發給接收端。

**為何不轉碼**：轉碼會引入 40–200ms 額外延遲並消耗大量 CPU，而直通 RTP 只需封包路由，延遲可控制在 10ms 以內。代價是所有端點必須支援相同 codec（VP8/Opus），這在現代瀏覽器中是安全假設。

### SDP 修改位置：Go 伺服器攔截，不在前端修改

Opus 參數（`useinbandfec=1;stereo=1;sprop-stereo=1;maxaveragebitrate=128000;minptime=10`）由 Go 伺服器在 offer/answer 交換時強制寫入 SDP，前端不需處理。

**為何不在前端修改 SDP**：前端修改 SDP 在不同瀏覽器（Safari/Firefox）行為不一致且難以維護；集中在伺服器端修改可確保所有連線統一使用相同參數，前端只需發送 offer，伺服器保證 codec 設定正確。

### 音訊管線：Web Audio API GainNode + ChannelSplitter/Merger

前端使用 Web Audio API 建立處理圖：`MediaStreamSource → GainNode(gain=5) → ChannelSplitter → [左聲道 GainNode(1.0), 右聲道 GainNode(1.0)] → ChannelMerger → MediaStreamDestination`，最後將 `MediaStreamDestination.stream` 送入 RTCPeerConnection。

**為何需要 Splitter/Merger**：錄音介面（如 Focusrite Scarlett）在 Chrome 下通常以單聲道輸入（channel 0 有訊號，channel 1 靜音）。不經 Splitter/Merger 的話，雙聲道 track 中右聲道會是靜音，接收端聽到音量只有一半且聲場偏左。Splitter/Merger 將 channel 0 複製到兩個聲道，確保雙聲道均勻輸出。

### 後台管理系統：Administrate gem + Devise

使用 `administrate` gem 快速生成後台 CRUD 介面，`devise` 處理管理員登入，`cancancan` 實作 RBAC 角色權限。

**為何不手刻後台**：後台管理為內部工具，功能需求明確（CRUD + 匯入/匯出），使用成熟 gem 可節省大量開發時間，並將精力集中在音訊相關核心功能。

### 好友系統資料模型：自關聯 has_many :through

`friendships` table 採用自關聯設計：`user_id` 與 `friend_id` 均指向 `users` table，並加 `status` 欄位（`pending` / `accepted` / `blocked`）。

**為何不用對稱記錄（雙向各一筆）**：雙向記錄在查詢時較直觀但更新需要兩筆記錄保持同步；單向 + status 的方式更節省空間，查詢時加入 `OR` 條件即可，且好友關係的發起方與接收方有明確語義差異（誰送出邀請）。

## Risks / Trade-offs

- **[Risk] 瀏覽器 getUserMedia 在 HTTPS 以外無法使用** → 開發環境需設定 localhost 豁免或使用自簽憑證（`mkcert`）
- **[Risk] Safari 的 Web Audio API 行為與 Chrome 不同，GainNode 可能有相容性問題** → 開發初期優先支援 Chrome，Safari 相容性列為後續 bug fix
- **[Risk] 直通 RTP 要求發送端與接收端 codec 完全一致，若瀏覽器協商選到不同 codec** → 在 SDP 修改時強制移除非 Opus/VP8 codec，確保只協商一種
- **[Risk] Go 伺服器與 Rails 分離部署，本地開發需同時啟動兩個服務** → 提供 `Procfile` / `docker-compose.yml`，用 Foreman 或 Docker Compose 統一啟動
- **[Risk] Solid Cable 使用 SQLite 或 PostgreSQL adapter，高並發推播可能有延遲** → 初期使用者規模小，PostgreSQL adapter 已足夠；若需擴展可切換為 Redis adapter

## Open Questions

- Go 媒體伺服器的 session token 驗證方式：Rails 生成 JWT 傳給前端，前端帶著 JWT 連線 Go server？或由 Rails 直接呼叫 Go server 建立 session 後返回 session ID？
- TURN server 是否自建？初期可使用免費的 TURN service（如 metered.ca），但需評估隱私與穩定性。
- 視訊 codec 選擇：VP8 vs H.264？VP8 在 Chrome 支援最好且無授權問題，H.264 在硬體加速上有優勢。建議預設 VP8，在 SDP 修改時同樣強制指定。
