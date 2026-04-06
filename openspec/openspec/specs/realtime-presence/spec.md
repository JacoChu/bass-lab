## ADDED Requirements

### Requirement: Online presence broadcast

The system SHALL broadcast a user's online/offline status to all of that user's accepted friends via ActionCable when the user connects to or disconnects from the `PresenceChannel`. The broadcast payload SHALL include `user_id` and `status` (`online` or `offline`).

#### Scenario: User comes online

- **WHEN** an authenticated user establishes a WebSocket connection and subscribes to `PresenceChannel`
- **THEN** the system broadcasts `{ user_id: <id>, status: "online" }` to all of that user's accepted friends who are currently subscribed to `PresenceChannel`

#### Scenario: User goes offline

- **WHEN** a subscribed user's WebSocket connection closes (browser close, navigation, or network drop)
- **THEN** the system broadcasts `{ user_id: <id>, status: "offline" }` to all of that user's accepted friends who are currently subscribed to `PresenceChannel`

#### Scenario: User with no online friends comes online

- **WHEN** an authenticated user connects to `PresenceChannel` and none of their friends are subscribed
- **THEN** the system records the presence state internally and broadcasts to zero recipients without error

---

### Requirement: Video call invitation push notification

The system SHALL allow a user to send a video call invitation to an online friend via ActionCable. The invitation SHALL be delivered through `InvitationChannel` and include `from_user_id`, `from_display_name`, and `session_token` (a short-lived token for connecting to the Go media server).

#### Scenario: User sends a video call invitation to an online friend

- **WHEN** user A calls `POST /api/invitations` with `{ to_user_id: B }`
- **THEN** the system generates a `session_token` valid for 120 seconds, broadcasts `{ from_user_id: A, from_display_name: "...", session_token: "<token>" }` to user B's `InvitationChannel` subscription, and returns HTTP 201 with the `session_token`

#### Scenario: Invited user accepts the invitation

- **WHEN** user B receives the invitation push and calls `POST /api/invitations/:token/accept`
- **THEN** the system validates that the `session_token` is not expired, returns HTTP 200 with `{ go_server_url: "<ws://media-server/ws/signal>", session_token: "<token>" }` so both clients can connect to the Go media server

#### Scenario: Invitation token has expired

- **WHEN** user B calls `POST /api/invitations/:token/accept` after the 120-second TTL has elapsed
- **THEN** the system returns HTTP 422 with error message "Invitation expired"

#### Scenario: User sends invitation to an offline friend

- **WHEN** user A calls `POST /api/invitations` with `{ to_user_id: B }` but user B is not subscribed to `PresenceChannel`
- **THEN** the system returns HTTP 422 with error message "User is not online"

---

### Requirement: ActionCable transport via Solid Cable

The system SHALL use Solid Cable (SQLite or PostgreSQL backed) as the ActionCable adapter. The adapter SHALL be configured in `config/cable.yml`. Redis SHALL NOT be required for ActionCable in the initial implementation.

#### Scenario: ActionCable connection without Redis

- **WHEN** the Rails server starts with Solid Cable configured and no Redis service running
- **THEN** ActionCable connections from clients are accepted and messages are delivered via the database-backed adapter without errors
