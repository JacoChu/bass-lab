## ADDED Requirements

### Requirement: Call lobby page

A `LobbyPage` component SHALL be accessible at route `/lobby`.
The root path `/` SHALL redirect to `/lobby` (replacing the previous redirect to `/friends`).
The page SHALL display a local camera preview using `navigator.mediaDevices.getUserMedia` in a small video element.
The local preview video element SHALL be muted (`muted` attribute) to prevent audio feedback.
The page SHALL provide microphone and camera mute/unmute toggle buttons; toggling mute SHALL call `track.enabled = false/true` on the corresponding MediaStreamTrack (not stop the track).
The page SHALL embed `DeviceSelector` to allow the user to choose audio/video input devices before starting a call.

#### Scenario: User opens lobby with camera

- **WHEN** a user navigates to `/lobby`
- **THEN** the browser SHALL request camera + microphone permission via `getUserMedia`
- **THEN** the local preview SHALL display the camera feed in a muted video element
- **THEN** DeviceSelector SHALL be visible for device switching

#### Scenario: User mutes microphone in lobby

- **WHEN** a user clicks the microphone mute button
- **THEN** the audio track's `enabled` property SHALL be set to `false`
- **THEN** the mute button icon SHALL change to indicate muted state
- **THEN** the MediaStreamTrack SHALL NOT be stopped (device remains acquired)

### Requirement: Friend selection and call initiation from lobby

The lobby page SHALL display a list of online friends (fetched from `GET /api/friends` and filtered by PresenceChannel online status).
Each online friend SHALL be listed with a green online indicator and a "通話" button.
Clicking "通話" SHALL call `POST /api/invitations` with `{ invitee_id }` and enter a waiting state showing "等待 {friend_name} 接受通話…".
A cancel button SHALL be available during the waiting state; clicking it SHALL clear the waiting state.
After 120 seconds without acceptance, the waiting state SHALL automatically clear and display "邀請已過期".
When the InvitationChannel broadcasts `{ accepted: true, session_token }`, the frontend SHALL navigate to `/call/:token`.
Offline friends SHALL be shown in a separate "離線" section below online friends and SHALL NOT have a "通話" button.

#### Scenario: User initiates call from lobby

- **WHEN** a user clicks "通話" next to an online friend
- **THEN** `POST /api/invitations` SHALL be called with the friend's user_id as `invitee_id`
- **THEN** the lobby SHALL show "等待 {friend_name} 接受通話…" with a cancel button
- **THEN** when accepted, navigation to `/call/:token` SHALL occur

#### Scenario: Invitation expires after timeout

- **WHEN** 120 seconds pass without the invited friend accepting
- **THEN** the waiting state SHALL clear automatically
- **THEN** the page SHALL display "邀請已過期"

### Requirement: Lobby camera preview teardown

When the user navigates away from `/lobby`, all MediaStreamTracks acquired for the preview SHALL be stopped (`.stop()`) to release the camera/microphone hardware.

#### Scenario: Camera released on navigation

- **WHEN** a user navigates away from `/lobby` (e.g., to `/friends`)
- **THEN** all acquired MediaStreamTracks SHALL be stopped
- **THEN** the camera indicator light SHALL turn off
