package signaling

import (
	"testing"
)

func TestSessionCreatedOnFirstClient(t *testing.T) {
	sm := newSessionManager()
	c := &client{send: make(chan []byte, 4)}

	err := sm.join("tok1", c, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	sess, ok := sm.sessions["tok1"]
	if !ok {
		t.Fatal("session not created")
	}
	if sess.peers[0] != c {
		t.Error("first peer not set correctly")
	}
}

func TestSecondClientJoinsSession(t *testing.T) {
	sm := newSessionManager()
	c1 := &client{send: make(chan []byte, 4)}
	c2 := &client{send: make(chan []byte, 4)}

	_ = sm.join("tok1", c1, false)
	err := sm.join("tok1", c2, false)
	if err != nil {
		t.Fatalf("second client join failed: %v", err)
	}
	sess := sm.sessions["tok1"]
	if sess.peers[1] != c2 {
		t.Error("second peer not set correctly")
	}
}

func TestThirdClientRejected(t *testing.T) {
	sm := newSessionManager()
	c1 := &client{send: make(chan []byte, 4)}
	c2 := &client{send: make(chan []byte, 4)}
	c3 := &client{send: make(chan []byte, 4)}

	_ = sm.join("tok1", c1, false)
	_ = sm.join("tok1", c2, false)
	err := sm.join("tok1", c3, false)
	if err == nil {
		t.Fatal("expected error for third client, got nil")
	}
	if err != errSessionFull {
		t.Errorf("expected errSessionFull, got %v", err)
	}
}

func TestRemoveSessionOnLeave(t *testing.T) {
	sm := newSessionManager()
	c1 := &client{send: make(chan []byte, 4)}
	c2 := &client{send: make(chan []byte, 4)}

	_ = sm.join("tok1", c1, false)
	_ = sm.join("tok1", c2, false)
	sm.leave("tok1", c1)

	if _, ok := sm.sessions["tok1"]; ok {
		t.Error("session should be removed when a peer leaves")
	}
}
