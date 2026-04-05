package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"github.com/pion/webrtc/v3"
)

func main() {
	http.HandleFunc("/offer", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" { return }

		var offer webrtc.SessionDescription
		json.NewDecoder(r.Body).Decode(&offer)

		peerConnection, _ := webrtc.NewPeerConnection(webrtc.Configuration{})

		// 1. 【核心修正】先建立好回傳軌道，這會寫入 Answer 的 SDP 中
		// 使用 Opus 預設參數
		localTrack, _ := webrtc.NewTrackLocalStaticRTP(webrtc.RTPCodecCapability{MimeType: webrtc.MimeTypeOpus}, "audio", "pion")
		peerConnection.AddTrack(localTrack)

		// 2. 監聽收到音軌
		peerConnection.OnTrack(func(track *webrtc.TrackRemote, receiver *webrtc.RTPReceiver) {
			fmt.Printf("🎸 收到 Bass 音軌: %s\n", track.Codec().MimeType)

			packetCount := 0
			for {
				rtp, _, err := track.ReadRTP()
				if err != nil { return }

				packetCount++
				// 彈奏時這裡的 byte 數應該要跳動 (例如 150-300 bytes)
				if packetCount % 100 == 0 {
					fmt.Printf("📦 轉發封包 #%d, 大小: %d bytes\n", packetCount, len(rtp.Payload))
				}

				// 直接寫回剛才建立的預設軌道
				if err := localTrack.WriteRTP(rtp); err != nil { return }
			}
		})

		// 3. 處理 ICE 狀態監控
		peerConnection.OnICEConnectionStateChange(func(s webrtc.ICEConnectionState) {
			fmt.Printf("❄️ ICE 狀態: %s\n", s.String())
		})

		peerConnection.SetRemoteDescription(offer)
		answer, _ := peerConnection.CreateAnswer(nil)

		gatherFinished := webrtc.GatheringCompletePromise(peerConnection)
		peerConnection.SetLocalDescription(answer)
		<-gatherFinished

		json.NewEncoder(w).Encode(peerConnection.LocalDescription())
	})

	fmt.Println("🚀 專業 Bass 網關運行中: http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}