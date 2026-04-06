package signaling

import (
	"errors"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/pion/webrtc/v3"
)

const trialDuration = 300 * time.Second

var errSessionFull = errors.New("session full")

type client struct {
	send chan []byte
	pc   *webrtc.PeerConnection
	conn *websocket.Conn // kept for trial termination only
}

type session struct {
	peers [2]*client
	count int
	trial bool
	timer *time.Timer
}

type sessionManager struct {
	mu       sync.Mutex
	sessions map[string]*session
}

func newSessionManager() *sessionManager {
	return &sessionManager{sessions: make(map[string]*session)}
}

// join adds c to the session identified by token.
// If trial is true and this is the 2nd joiner, a 300-second timer is started.
// Returns errSessionFull if the session already has 2 clients.
func (sm *sessionManager) join(token string, c *client, trial bool) error {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	sess, ok := sm.sessions[token]
	if !ok {
		sess = &session{trial: trial}
		sm.sessions[token] = sess
	}
	if sess.count >= 2 {
		return errSessionFull
	}
	sess.peers[sess.count] = c
	sess.count++

	// Start trial timer when the 2nd peer joins.
	if sess.count == 2 && sess.trial {
		peers := [2]*client{sess.peers[0], sess.peers[1]}
		sess.timer = time.AfterFunc(trialDuration, func() {
			log.Printf("trial session %s expired — closing connections", token)
			for _, p := range peers {
				if p != nil && p.conn != nil {
					_ = p.conn.WriteMessage(websocket.CloseMessage,
						websocket.FormatCloseMessage(4004, "Trial session ended"))
					p.conn.Close()
				}
			}
		})
	}
	return nil
}

// peer returns the other client in the session, or nil if not yet joined.
func (sm *sessionManager) peer(token string, c *client) *client {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	sess, ok := sm.sessions[token]
	if !ok {
		return nil
	}
	for _, p := range sess.peers {
		if p != nil && p != c {
			return p
		}
	}
	return nil
}

// leave removes c from the session and, if the session becomes empty, deletes it.
func (sm *sessionManager) leave(token string, c *client) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	sess, ok := sm.sessions[token]
	if !ok {
		return
	}
	for i, p := range sess.peers {
		if p == c {
			sess.peers[i] = nil
			sess.count--
		}
	}
	// Cancel trial timer if still running.
	if sess.timer != nil {
		sess.timer.Stop()
	}
	// Close the remaining peer's PeerConnection so both sides are torn down.
	for _, p := range sess.peers {
		if p != nil && p.pc != nil {
			_ = p.pc.Close()
		}
	}
	delete(sm.sessions, token)
}
