## ADDED Requirements

### Requirement: Trial session allowance

The system SHALL grant each new user 2 free trial sessions, each with a maximum duration of 5 minutes.
The `users` table SHALL include a `trial_sessions_used` column (integer, default: 0) to track consumed trial sessions.
When a user initiates or joins a video session, the system SHALL check eligibility: the user MUST have either an active subscription (`orders.status = confirmed AND orders.expires_at > NOW()`) OR `trial_sessions_used < 2`.
If the user has no active subscription AND `trial_sessions_used >= 2`, the system SHALL reject the session request with HTTP 403 and `{ error: "No active subscription. Please subscribe to continue." }`.
When a trial session ends, the system SHALL increment `trial_sessions_used` by 1.
Trial sessions SHALL be automatically terminated after 5 minutes via the Go media server.

#### Scenario: First-time user starts a trial session

- **WHEN** a user with `trial_sessions_used = 0` and no active subscription initiates a video session
- **THEN** the system SHALL permit the session and record the trial usage upon session end

#### Scenario: User exhausts trial sessions

- **WHEN** a user with `trial_sessions_used = 2` and no active subscription attempts to initiate a video session
- **THEN** the system SHALL return HTTP 403 with `{ error: "No active subscription. Please subscribe to continue." }`

#### Scenario: Trial session reaches 5-minute limit

- **WHEN** a trial session has been active for 5 minutes
- **THEN** the Go media server SHALL close the WebSocket connections for both peers with close code 4004

#### Scenario: Subscribed user is not limited by trial count

- **WHEN** a user with `trial_sessions_used = 2` AND an active subscription (confirmed, not expired) initiates a session
- **THEN** the system SHALL permit the session without restriction

---

### Requirement: Subscription plans

The system SHALL support two subscription periods: `monthly` and `yearly`.
The `orders` table SHALL include a `period` column (enum: monthly/yearly) and an `expires_at` column (timestamp) indicating when the subscription expires.
An active subscription is defined as: `orders.status = confirmed AND orders.expires_at > NOW()` for the given user.
Each user MAY have multiple order records but only the most recent active order determines subscription eligibility.

#### Scenario: User with confirmed monthly subscription accesses session

- **WHEN** a user has an order with `status = confirmed`, `period = monthly`, and `expires_at` in the future
- **THEN** the system SHALL permit unlimited video sessions

#### Scenario: User with expired subscription is denied

- **WHEN** a user's most recent order has `expires_at` in the past
- **THEN** the system SHALL treat the user as unsubscribed and apply trial session rules

---

### Requirement: User subscription self-service

The system SHALL allow authenticated users to view their own subscription history and cancel active subscriptions.
`GET /api/subscriptions` SHALL return all of the current user's orders, ordered by `created_at DESC`, each record including: `id`, `status`, `period`, `amount_cents`, `expires_at`, `created_at`.
`DELETE /api/subscriptions/:id` SHALL cancel the subscription by setting `status = cancelled` on the specified order. The user MAY only cancel their own orders; attempting to cancel another user's order SHALL return HTTP 404.

#### Scenario: User views subscription history

- **WHEN** an authenticated user calls `GET /api/subscriptions`
- **THEN** the system SHALL return HTTP 200 with an array of the user's orders, most recent first

#### Scenario: User cancels own active subscription

- **WHEN** an authenticated user calls `DELETE /api/subscriptions/:id` with their own order ID
- **THEN** the system SHALL set that order's `status = cancelled` and return HTTP 200

#### Scenario: User attempts to cancel another user's subscription

- **WHEN** an authenticated user calls `DELETE /api/subscriptions/:id` with an order belonging to a different user
- **THEN** the system SHALL return HTTP 404

---

### Requirement: Admin subscription management

The system SHALL allow `super_admin` users to view all subscriptions and edit or cancel any user's subscription from the admin panel.
The admin orders dashboard SHALL display: `id`, `user_id`, `user email`, `status`, `period`, `amount_cents`, `expires_at`, `created_at`.
`super_admin` SHALL be able to filter orders by `status` and `created_at` date range.
`super_admin` SHALL be able to update `status`, `period`, and `expires_at` on any order.

#### Scenario: Admin views all orders with status filter

- **WHEN** a super_admin selects `status = confirmed` from the filter in the admin orders list
- **THEN** the system SHALL render only orders with `status = confirmed`

#### Scenario: Admin cancels a user subscription

- **WHEN** a super_admin edits an order and sets `status = cancelled`
- **THEN** the system SHALL persist the change; the affected user SHALL be denied new sessions if they have no remaining trial sessions

#### Scenario: Admin filters by date range

- **WHEN** a super_admin sets a `created_at` date range filter
- **THEN** the system SHALL render only orders created within that range
