## Why

樂手進行視訊遠端教學時，市面上的通話工具（Zoom、Meet）會主動啟用回聲消除與噪音抑制，導致貝斯低頻（尤其是第四、五弦）嚴重失真，且 bitrate 壓縮使音色細節喪失。Bass-Lab 需要一個專為樂手設計的影音協作空間，能繞過瀏覽器預設的音訊處理、保留完整低頻細節，並在多人連線時維持極低延遲與完美影音同步。

## What Changes

- **新增後台管理系統**：管理員可透過 Rails 後台進行登入驗證、角色權限控管及訂單管理。
- **新增好友系統**：使用者可互相加好友、管理好友關係，並在好友列表查看即時上線狀態。
- **新增即時通知機制**：透過 ActionCable (Solid Cable) 推播「好友上線/離線」狀態更新與「視訊邀請」通知。
- **新增 Go 媒體伺服器**：以 Go + Pion 實作 WebRTC 信令交換與 SFU 媒體轉發，接收 RTP 封包後不解碼、直接轉發，確保最低處理延遲。
- **新增裝置選擇器**：前端提供音訊/視訊輸入裝置選單，使用 `enumerateDevices()` 列舉所有裝置並支援以 `deviceId` 指定特定錄音介面通道。
- **新增音訊處理管線**：取得音訊串流後強制關閉 `echoCancellation`、`noiseSuppression`、`autoGainControl`；掛載 `GainNode`（放大 5 倍）與 `ChannelSplitter/Merger` 解決單聲道錄音介面輸入問題，確保雙聲道輸出均勻。
- **新增 SDP 優化**：Go 伺服器攔截並修改 SDP，強制音軌使用 Opus 128kbps 雙聲道（`useinbandfec=1;stereo=1;sprop-stereo=1;maxaveragebitrate=128000;minptime=10`）。

## Non-Goals

- 不包含 i18n 多語系支援（可另立 change 處理）
- 不包含錄音/錄影儲存功能（本次僅處理即時串流）
- 不包含行動裝置（iOS/Android App）支援，僅限桌面瀏覽器
- 不包含多房間/多人同時連線（本次 SFU 專注於一對一或小型 session）
- 不包含付款金流整合（訂單管理僅含後台 CRUD，不含線上付款）
- 不包含 CSV 資料匯入/匯出（需求不明確，待後續另立 change 定義）

## Capabilities

### New Capabilities

- `admin-panel`: 後台管理系統，含登入驗證、角色權限（RBAC）、訂單 CRUD
- `friend-system`: 好友關係資料模型與 API，含好友邀請、接受/拒絕、解除好友操作
- `realtime-presence`: 以 ActionCable (Solid Cable) 實作的即時上線狀態廣播與視訊邀請推播通知
- `webrtc-media-server`: Go + Pion 媒體伺服器，負責 WebRTC 信令交換（offer/answer/ICE）、SDP 攔截修改與 RTP 封包直通轉發（SFU，不解碼）
- `device-selector`: React 前端裝置選擇 UI，使用 `navigator.mediaDevices.enumerateDevices()` 列舉並允許選取特定 `deviceId`
- `audio-pipeline`: React 前端音訊前處理管線，包含停用瀏覽器 DSP 處理、`GainNode` 前級增益（5x）、`ChannelSplitter/Merger` 雙聲道處理

### Modified Capabilities

（無）

## Impact

- Affected specs: `admin-panel`, `friend-system`, `realtime-presence`, `webrtc-media-server`, `device-selector`, `audio-pipeline`
- Affected code:
  - `app/models/` — User, Friendship, Order 模型
  - `app/controllers/admin/` — 後台管理控制器
  - `app/channels/` — ActionCable channel（PresenceChannel, InvitationChannel）
  - `app/javascript/` — React SPA 主要前端程式碼
  - `app/javascript/components/DeviceSelector/` — 裝置選擇器元件
  - `app/javascript/hooks/useAudioPipeline.ts` — 音訊管線 hook
  - `media-server/` — Go 媒體伺服器（獨立服務）
  - `media-server/signaling/` — WebRTC 信令處理
  - `media-server/sfu/` — SFU RTP 轉發邏輯
  - `media-server/sdp/` — SDP 修改邏輯
  - `db/migrate/` — User、Friendship、Order 相關 migration
  - `config/cable.yml` — Solid Cable 設定
