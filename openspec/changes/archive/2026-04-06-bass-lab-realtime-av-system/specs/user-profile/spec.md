## ADDED Requirements

### Requirement: User profile management page

A `ProfilePage` component SHALL be accessible at route `/profile`.
The page SHALL display the user's current `display_name` and `email` (read from `GET /api/profile`).
The Rails API SHALL expose `GET /api/profile` returning `{ display_name, email, trial_sessions_used, otp_required_for_login }`.

#### Scenario: User opens profile page

- **WHEN** a user navigates to `/profile`
- **THEN** the page SHALL call `GET /api/profile`
- **THEN** the user's current `display_name` and `email` SHALL be displayed
- **THEN** sections for name edit, password change, email change, and 2FA management SHALL be visible

### Requirement: Display name update

The Rails API SHALL expose `PATCH /api/profile` accepting `{ display_name }` and updating only the `display_name` field.
Success SHALL return HTTP 200 plus the updated user JSON; validation failure SHALL return HTTP 422 plus `{ errors }`.
On submit, the frontend SHALL call `PATCH /api/profile` with `{ display_name }`.
On success, the displayed name SHALL update immediately without a page reload.
On failure (422), the error message SHALL be shown beneath the field.

#### Scenario: User updates display name

- **WHEN** a user edits their display_name and submits
- **THEN** `PATCH /api/profile` SHALL be called with the new value
- **THEN** on success the page SHALL show the updated name without reload

#### Scenario: Empty display name rejected

- **WHEN** a user submits an empty display_name
- **THEN** the API SHALL return HTTP 422 with `{ errors }`
- **THEN** the error SHALL be displayed beneath the field

### Requirement: Password change

The profile page SHALL provide a password change form with three fields: `current_password`, `new_password`, `new_password_confirmation`.
The frontend SHALL call `POST /api/profile/password` with those three fields.
The Rails API SHALL validate `current_password` using `resource.valid_password?`; if invalid, return HTTP 422 + `{ error: "Current password is incorrect" }`.
If valid, the API SHALL call `resource.update!(password: params[:new_password])` and return HTTP 200.
`new_password` SHALL meet Devise's minimum length (6 characters); shorter values return HTTP 422 + `{ errors }`.

#### Scenario: Password change with wrong current password

- **WHEN** a user submits the password form with an incorrect `current_password`
- **THEN** the API SHALL return HTTP 422 with `{ error: "Current password is incorrect" }`
- **THEN** the frontend SHALL display the error beneath the form

#### Scenario: Successful password change

- **WHEN** a user submits the password form with the correct `current_password` and a valid new password
- **THEN** the API SHALL return HTTP 200
- **THEN** the frontend SHALL display a success confirmation

### Requirement: Email change with verification

The profile page SHALL provide an email change input accepting a new email address.
On submit, the frontend SHALL call `PATCH /api/profile/email` with `{ email }`.
The Rails API SHALL update `unconfirmed_email` and trigger Devise's confirmation email to the new address.
The API SHALL return HTTP 200 + `{ message: "Confirmation email sent. Please check your new inbox." }`.
On format validation failure, the API SHALL return HTTP 422 + `{ errors }`.
The frontend SHALL display the confirmation message text returned by the API.

#### Scenario: Email change triggers confirmation flow

- **WHEN** a user submits a new email address
- **THEN** `PATCH /api/profile/email` SHALL be called
- **THEN** a confirmation email SHALL be sent to the new address
- **THEN** the frontend SHALL show "Confirmation email sent. Please check your new inbox."

#### Scenario: Invalid email format rejected

- **WHEN** a user submits a malformed email address
- **THEN** the API SHALL return HTTP 422 with `{ errors }`
- **THEN** the frontend SHALL display the error

### Requirement: 2FA management on profile page

The profile page SHALL display the current 2FA status: "已啟用" or "未啟用".
When 2FA is not enabled, the page SHALL show an "啟用 2FA" button.
Clicking "啟用 2FA" SHALL call `GET /users/two_factor/setup`, display the returned QR Code SVG, and show an OTP input field.
Submitting the OTP SHALL call `POST /users/two_factor/enable`; success updates the displayed status to "已啟用".
When 2FA is enabled, the page SHALL show a "停用 2FA" button.
Clicking "停用 2FA" SHALL call `DELETE /users/two_factor`; success updates the displayed status to "未啟用".

#### Scenario: User enables 2FA

- **WHEN** a user clicks "啟用 2FA"
- **THEN** `GET /users/two_factor/setup` SHALL be called
- **THEN** a QR Code SVG SHALL be displayed with an OTP input field
- **WHEN** the user enters a valid OTP and submits
- **THEN** `POST /users/two_factor/enable` SHALL be called
- **THEN** the status SHALL update to "已啟用"

#### Scenario: User disables 2FA

- **WHEN** a user with 2FA enabled clicks "停用 2FA"
- **THEN** `DELETE /users/two_factor` SHALL be called
- **THEN** the status SHALL update to "未啟用"
