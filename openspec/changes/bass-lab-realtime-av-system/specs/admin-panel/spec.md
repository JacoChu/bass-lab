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

The system SHALL assign each admin user one of two roles: `super_admin` or `staff`. `super_admin` SHALL have full access to all admin panel resources. `staff` SHALL have read-only access to orders and users but SHALL NOT access the role management interface.

#### Scenario: Super admin accesses role management

- **WHEN** a `super_admin` visits `/admin/admin_users`
- **THEN** the system renders the admin user list with options to create, edit, and delete admin accounts

#### Scenario: Staff attempts to access role management

- **WHEN** a `staff` user visits `/admin/admin_users`
- **THEN** the system denies access and renders a 403 Forbidden page

#### Scenario: Staff views order list

- **WHEN** a `staff` user visits `/admin/orders`
- **THEN** the system renders the order list in read-only mode without edit or delete actions

---

### Requirement: Order management

The system SHALL provide a CRUD interface for orders. An order SHALL contain at minimum: `id`, `user_id`, `status` (enum: `pending`, `confirmed`, `cancelled`), `amount_cents` (integer), `created_at`, `updated_at`. Admins SHALL be able to filter orders by `status` and `created_at` date range.

#### Scenario: Admin views order list with status filter

- **WHEN** an admin selects status `confirmed` from the filter dropdown and submits
- **THEN** the system renders only orders with `status = confirmed`

#### Scenario: Admin updates order status

- **WHEN** an admin edits an order and changes `status` from `pending` to `confirmed`
- **THEN** the system persists the change and renders the order detail page with the updated status

#### Scenario: Admin views order list with date range filter

- **WHEN** an admin sets `created_at` start date to `2025-01-01` and end date to `2025-12-31`
- **THEN** the system renders only orders created within that date range


