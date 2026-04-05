package signaling

import "net/http"

// HandleWebSocket handles WebSocket connections for WebRTC signaling.
// Full implementation in task 6.1.
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "not implemented", http.StatusNotImplemented)
}
