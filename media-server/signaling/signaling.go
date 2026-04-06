package signaling

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"bass-lab/media-server/sdp"

	"github.com/gorilla/websocket"
	"github.com/pion/webrtc/v3"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// railsBaseURL is configured by SetRailsBaseURL before starting the server.
var railsBaseURL = "http://localhost:3000"

var sessions = newSessionManager()

type signalMsg struct {
	Type      string `json:"type"`
	SDP       string `json:"sdp,omitempty"`
	Candidate string `json:"candidate,omitempty"`
}

// HandleWebSocket handles WebSocket connections for WebRTC signaling.
// Tasks 6.1–6.4, 6.6, 6.7.
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" || !validateToken(token) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			http.Error(w, "upgrade failed", http.StatusBadRequest)
			return
		}
		_ = conn.WriteMessage(websocket.CloseMessage,
			websocket.FormatCloseMessage(4001, "Unauthorized"))
		conn.Close()
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("websocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	c := &client{send: make(chan []byte, 32)}

	if joinErr := sessions.join(token, c); joinErr == errSessionFull {
		_ = conn.WriteMessage(websocket.CloseMessage,
			websocket.FormatCloseMessage(4003, "Session full"))
		return
	}
	defer sessions.leave(token, c)

	// Set up WebRTC PeerConnection for SFU RTP passthrough (task 6.6).
	pc, err := newPeerConnection()
	if err != nil {
		log.Printf("failed to create peer connection: %v", err)
		return
	}
	c.pc = pc
	defer pc.Close()

	// Forward incoming RTP tracks to the peer without decoding (task 6.6).
	pc.OnTrack(func(remoteTrack *webrtc.TrackRemote, _ *webrtc.RTPReceiver) {
		peer := sessions.peer(token, c)
		if peer == nil || peer.pc == nil {
			return
		}
		localTrack, trackErr := webrtc.NewTrackLocalStaticRTP(
			remoteTrack.Codec().RTPCodecCapability, remoteTrack.ID(), remoteTrack.StreamID(),
		)
		if trackErr != nil {
			log.Printf("failed to create local track: %v", trackErr)
			return
		}
		if _, addErr := peer.pc.AddTrack(localTrack); addErr != nil {
			log.Printf("failed to add track to peer: %v", addErr)
			return
		}
		buf := make([]byte, 1500)
		for {
			n, _, readErr := remoteTrack.Read(buf)
			if readErr != nil {
				return
			}
			if _, writeErr := localTrack.Write(buf[:n]); writeErr != nil {
				return
			}
		}
	})

	// Write pump: drain c.send channel to the WebSocket.
	go func() {
		for msg := range c.send {
			if writeErr := conn.WriteMessage(websocket.TextMessage, msg); writeErr != nil {
				return
			}
		}
	}()

	// Read pump (blocking until connection closes — task 6.7 cleanup via defer).
	for {
		_, raw, readErr := conn.ReadMessage()
		if readErr != nil {
			return
		}

		var msg signalMsg
		if jsonErr := json.Unmarshal(raw, &msg); jsonErr != nil {
			continue
		}

		peer := sessions.peer(token, c)

		switch msg.Type {
		case "offer":
			// Relay offer as-is; SDP modification is applied only to the answer (task 6.4).
			if peer != nil {
				relay(peer, raw)
			}

		case "answer":
			// Intercept and modify SDP before forwarding (tasks 6.4 + 6.5).
			modified := sdp.Modify(msg.SDP)
			out, _ := json.Marshal(signalMsg{Type: "answer", SDP: modified})
			if peer != nil {
				relay(peer, out)
			}

		case "candidate":
			// Forward ICE candidate to the other peer (task 6.3).
			if peer != nil {
				relay(peer, raw)
			}
		}
	}
}

func relay(peer *client, msg []byte) {
	select {
	case peer.send <- msg:
	default:
		log.Printf("peer send buffer full, dropping message")
	}
}

// validateToken calls Rails GET /api/sessions/validate?token=<token> (task 6.1).
func validateToken(token string) bool {
	url := fmt.Sprintf("%s/api/sessions/validate?token=%s", railsBaseURL, token)
	resp, err := http.Get(url) //nolint:gosec
	if err != nil {
		log.Printf("token validation request failed: %v", err)
		return false
	}
	defer resp.Body.Close()

	var result struct {
		Valid bool `json:"valid"`
	}
	body, _ := io.ReadAll(resp.Body)
	if jsonErr := json.Unmarshal(body, &result); jsonErr != nil {
		return false
	}
	return result.Valid
}

// newPeerConnection creates a WebRTC PeerConnection with VP8 + Opus codecs only.
func newPeerConnection() (*webrtc.PeerConnection, error) {
	m := &webrtc.MediaEngine{}
	if err := m.RegisterCodec(webrtc.RTPCodecParameters{
		RTPCodecCapability: webrtc.RTPCodecCapability{
			MimeType: webrtc.MimeTypeOpus, ClockRate: 48000, Channels: 2,
		},
		PayloadType: 111,
	}, webrtc.RTPCodecTypeAudio); err != nil {
		return nil, err
	}
	if err := m.RegisterCodec(webrtc.RTPCodecParameters{
		RTPCodecCapability: webrtc.RTPCodecCapability{
			MimeType: webrtc.MimeTypeVP8, ClockRate: 90000,
		},
		PayloadType: 96,
	}, webrtc.RTPCodecTypeVideo); err != nil {
		return nil, err
	}
	api := webrtc.NewAPI(webrtc.WithMediaEngine(m))
	return api.NewPeerConnection(webrtc.Configuration{})
}

// SetRailsBaseURL allows main to configure the Rails backend URL.
func SetRailsBaseURL(url string) {
	railsBaseURL = url
}
