## ADDED Requirements

### Requirement: WebRTC signaling over WebSocket

The Go media server SHALL accept WebSocket connections at `/ws/signal`. Clients SHALL authenticate by including a `session_token` query parameter (e.g., `/ws/signal?token=<token>`). The server SHALL validate the token against a shared secret or via HTTP callback to the Rails API. Connections with missing or invalid tokens SHALL be rejected with WebSocket close code 4001.

#### Scenario: Client connects with a valid session token

- **WHEN** a client opens a WebSocket connection to `/ws/signal?token=<valid_token>`
- **THEN** the Go server validates the token, accepts the connection, and the client enters the `waiting` state for the session

#### Scenario: Client connects with an invalid or expired token

- **WHEN** a client opens a WebSocket connection with a missing or expired `token`
- **THEN** the Go server closes the WebSocket connection with close code 4001 and reason "Unauthorized"

---

### Requirement: SDP offer/answer exchange

The Go media server SHALL relay and intercept SDP offer/answer messages between two clients in the same session. Before forwarding an answer, the server SHALL modify the SDP to enforce Opus audio parameters. For video tracks, the server SHALL remove all codecs except VP8.

The required Opus SDP fmtp parameters are:
- `useinbandfec=1`
- `stereo=1`
- `sprop-stereo=1`
- `maxaveragebitrate=128000`
- `minptime=10`

#### Scenario: Server modifies audio SDP before forwarding answer

- **WHEN** the Go server receives an SDP answer containing an audio `m=audio` section
- **THEN** the server rewrites the Opus `a=fmtp` line to include all 5 required parameters before forwarding the SDP to the peer

#### Scenario: Server removes non-VP8 video codecs

- **WHEN** the Go server processes an SDP offer or answer containing multiple video codecs (VP8, H.264, AV1)
- **THEN** the server removes all codec entries except VP8 and its associated `rtpmap`/`fmtp`/`rtcp-fb` lines, then forwards the modified SDP

#### Scenario: ICE candidate exchange

- **WHEN** a client sends an ICE candidate JSON message `{ "type": "candidate", "candidate": "..." }`
- **THEN** the Go server forwards the candidate message to the other client in the same session

---

### Requirement: RTP forwarding (SFU passthrough)

The Go media server SHALL forward RTP packets between the two peers in a session without decoding or re-encoding. Audio (Opus) and video (VP8) RTP packets received from peer A SHALL be forwarded directly to peer B's outbound RTP track, and vice versa. The server SHALL NOT buffer or batch RTP packets.

#### Scenario: Audio RTP packet forwarded without decoding

- **WHEN** the Go server receives an RTP packet on an audio track from peer A
- **THEN** the server writes the packet bytes directly to peer B's audio track sender without inspecting the payload

#### Scenario: Video RTP packet forwarded without decoding

- **WHEN** the Go server receives an RTP packet on a video track from peer A
- **THEN** the server writes the packet bytes directly to peer B's video track sender without inspecting the payload

#### Scenario: Session ends when a peer disconnects

- **WHEN** one peer's WebSocket or RTP connection closes
- **THEN** the Go server closes the peer connection for both parties and removes the session from memory

---

### Requirement: Session management

The Go media server SHALL manage sessions in memory. A session is created when the first client connects with a `session_token`. The second client connecting with the same token joins the existing session. A session SHALL support exactly 2 participants. A third client attempting to join the same session SHALL be rejected with WebSocket close code 4003.

#### Scenario: Second client joins a session

- **WHEN** client B connects with the same `session_token` as client A, and the session has 1 participant
- **THEN** the Go server adds client B to the session, and WebRTC signaling between A and B begins

#### Scenario: Third client attempts to join a full session

- **WHEN** a third client attempts to connect with a `session_token` that already has 2 participants
- **THEN** the Go server closes the connection with close code 4003 and reason "Session full"
