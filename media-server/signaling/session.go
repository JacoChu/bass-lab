package signaling

import (
	"errors"
	"sync"

	"github.com/pion/webrtc/v3"
)

var errSessionFull = errors.New("session full")

type client struct {
	send chan []byte
	pc   *webrtc.PeerConnection
}

type session struct {
	peers [2]*client
	count int
}

type sessionManager struct {
	mu       sync.Mutex
	sessions map[string]*session
}

func newSessionManager() *sessionManager {
	return &sessionManager{sessions: make(map[string]*session)}
}

// join adds c to the session identified by token.
// Returns the peer already in the session (nil if this is the first joiner),
// and an error if the session is already full.
func (sm *sessionManager) join(token string, c *client) error {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	sess, ok := sm.sessions[token]
	if !ok {
		sess = &session{}
		sm.sessions[token] = sess
	}
	if sess.count >= 2 {
		return errSessionFull
	}
	sess.peers[sess.count] = c
	sess.count++
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
	// Close the remaining peer's PeerConnection so both sides are torn down.
	for _, p := range sess.peers {
		if p != nil && p.pc != nil {
			_ = p.pc.Close()
		}
	}
	delete(sm.sessions, token)
}
