## ADDED Requirements

### Requirement: Admin authentication

The system SHALL require administrators to authenticate with email and password before accessing any admin panel route. Unauthenticated requests to `/admin/**` SHALL be redirected to the admin sign-in page.

#### Scenario: Successful admin login

- **WHEN** an admin submits valid email and password on `/admin/sign_in`
- **THEN** the system authenticates the session and redirects the admin to `/admin/dashboard`

#### Scenario: Failed admin login with wrong password

- **WHEN** an admin submits an incorrect password
- **THEN** the system rejects the request and renders the sign-in form with an error message "Invalid email or password"

#### Scenario: Unauthenticated access attempt

- **WHEN** an unauthenticated user visits any `/admin/**` route
- **THEN** the system redirects the request to `/admin/sign_in`

---

### Requirement: Role-based access control (RBAC)

The system SHALL restrict access to the admin panel to users with `role = super_admin` only. Any authenticated user without `super_admin` role SHALL receive HTTP 403 when accessing any `/admin/**` route. The `staff` role SHALL NOT be granted admin panel access in the current implementation.

#### Scenario: Super admin accesses admin panel

- **WHEN** a user with `role = super_admin` visits any `/admin/**` route
- **THEN** the system SHALL render the requested admin page

#### Scenario: Regular user attempts admin access

- **WHEN** an authenticated user with `role = user` visits any `/admin/**` route
- **THEN** the system SHALL return HTTP 403 Forbidden

#### Scenario: Super admin manages user roles

- **WHEN** a super_admin visits `/admin/admin_users`
- **THEN** the system SHALL render the user list showing only users with `role = super_admin`, with options to edit or remove admin access

---

### Requirement: Order management

The system SHALL provide a CRUD interface for subscription orders. An order SHALL contain: `id`, `user_id`, `status` (enum: `pending`, `confirmed`, `cancelled`), `period` (enum: `monthly`, `yearly`), `amount_cents` (integer), `expires_at` (timestamp), `created_at`, `updated_at`. Super admin SHALL be able to filter orders by `status` and `created_at` date range. Super admin SHALL be able to edit `status`, `period`, and `expires_at` on any order.

#### Scenario: Admin views order list with status filter

- **WHEN** an admin selects status `confirmed` from the filter dropdown and submits
- **THEN** the system renders only orders with `status = confirmed`

#### Scenario: Admin cancels a subscription

- **WHEN** an admin edits an order and changes `status` to `cancelled`
- **THEN** the system persists the change; the affected user loses active subscription access

#### Scenario: Admin views order list with date range filter

- **WHEN** an admin sets `created_at` start and end dates
- **THEN** the system renders only orders created within that date range

#### Scenario: Admin extends a subscription

- **WHEN** an admin edits an order and updates `expires_at` to a future date
- **THEN** the system persists the change and the user regains active subscription access

---

### Requirement: User detail view with friends and orders

The system SHALL display on each user's show page (`/admin/users/:id`): (1) a list of accepted friends showing `display_name` for each friendship where `user_id = id OR friend_id = id AND status = accepted`; (2) a list of that user's orders showing `id`, `status`, `period`, `expires_at`, each row linkable to `/admin/orders/:order_id`.

#### Scenario: Admin views a user's accepted friends

- **WHEN** a super_admin visits `/admin/users/:id`
- **THEN** the show page SHALL render a "Friends" section listing all accepted friendships (display_name of the other party); if the user has no accepted friends the section SHALL render empty

#### Scenario: Admin navigates from user to order

- **WHEN** a super_admin visits `/admin/users/:id` and clicks an order row
- **THEN** the system SHALL navigate to `/admin/orders/:order_id` showing that order's details

---

### Requirement: Admin creates subscription for user

The system SHALL allow a super_admin to create a new subscription order for any user directly from the user detail page (`/admin/users/:id`). The user detail page SHALL display a "New Subscription" link that navigates to `/admin/orders/new` with `user_id` pre-populated. The new order form SHALL accept `period` (monthly/yearly), `amount_cents`, and `expires_at`; `status` SHALL default to `confirmed`; `user_id` SHALL be read-only on the form (pre-filled and not editable). The created order SHALL immediately satisfy the `User#session_eligible?` check if `expires_at` is in the future.

#### Scenario: Admin creates a monthly subscription from the user page

- **WHEN** a super_admin visits `/admin/users/:id` and clicks "New Subscription"
- **THEN** the system navigates to `/admin/orders/new?user_id=<id>` with `user_id` field pre-filled and read-only, `status` defaulting to `confirmed`

#### Scenario: Admin submits valid subscription form

- **WHEN** a super_admin fills in `period = monthly`, `amount_cents`, `expires_at` (future date) and submits
- **THEN** the system creates the order with `status = confirmed` and redirects to `/admin/orders/:new_order_id`; the user immediately gains active subscription access

#### Scenario: Admin submits subscription form with missing required field

- **WHEN** a super_admin submits the new order form without `expires_at`
- **THEN** the system renders the form again with a validation error and does not create the order
