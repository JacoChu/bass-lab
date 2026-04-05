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
