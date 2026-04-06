## ADDED Requirements

### Requirement: Friend request lifecycle

The system SHALL allow a user to send a friend request to another user. A friendship record SHALL have a `status` field with values: `pending`, `accepted`, `blocked`. A user SHALL NOT send a duplicate friend request if a `pending` or `accepted` record already exists between the two users.

#### Scenario: User sends a friend request

- **WHEN** user A sends a friend request to user B (no prior relationship exists)
- **THEN** the system creates a `friendships` record with `user_id = A`, `friend_id = B`, `status = pending` and returns HTTP 201

#### Scenario: Duplicate friend request is rejected

- **WHEN** user A sends a friend request to user B, and a `pending` record already exists from A to B
- **THEN** the system rejects the request and returns HTTP 422 with error message "Friend request already sent"

#### Scenario: User accepts a friend request

- **WHEN** user B calls the accept endpoint for the friendship request from user A
- **THEN** the system updates the friendship record to `status = accepted` and returns HTTP 200

#### Scenario: User declines a friend request

- **WHEN** user B calls the decline endpoint for the friendship request from user A
- **THEN** the system deletes the friendship record and returns HTTP 200

---

### Requirement: Friend list retrieval

The system SHALL provide an API endpoint that returns the authenticated user's friend list. The list SHALL include only users with `status = accepted`. Each entry SHALL include: `user_id`, `display_name`, `avatar_url`.

#### Scenario: User retrieves their friend list

- **WHEN** an authenticated user calls `GET /api/friends`
- **THEN** the system returns an array of friend objects, each containing `user_id`, `display_name`, and `avatar_url`, limited to friends with `status = accepted`

#### Scenario: User with no friends retrieves friend list

- **WHEN** an authenticated user with no accepted friendships calls `GET /api/friends`
- **THEN** the system returns an empty array `[]` with HTTP 200

---

### Requirement: Remove friend

The system SHALL allow a user to remove an existing friend. Removing a friend SHALL delete the friendship record regardless of which side initiated the original request.

#### Scenario: User removes a friend

- **WHEN** user A calls the remove endpoint for their friendship with user B (status = accepted)
- **THEN** the system deletes the friendship record and returns HTTP 200

#### Scenario: User attempts to remove a non-existent friendship

- **WHEN** user A calls the remove endpoint for user C, but no friendship record exists between them
- **THEN** the system returns HTTP 404 with error message "Friendship not found"

---

### Requirement: Pending friend request list

The system SHALL provide an API endpoint that returns all incoming pending friend requests for the authenticated user. Each entry SHALL include `requester_id`, `display_name`, `avatar_url`, and `requested_at`.

#### Scenario: User retrieves incoming friend requests

- **WHEN** an authenticated user calls `GET /api/friends/requests`
- **THEN** the system returns an array of pending request objects where `friend_id` equals the authenticated user's ID, including `requester_id`, `display_name`, `avatar_url`, and `requested_at`
