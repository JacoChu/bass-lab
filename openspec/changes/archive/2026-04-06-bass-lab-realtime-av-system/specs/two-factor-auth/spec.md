## ADDED Requirements

### Requirement: TOTP two-factor authentication

The system SHALL implement optional TOTP-based two-factor authentication using `devise-two-factor`.
The `users` table SHALL include `otp_secret` (encrypted string), `otp_required_for_login` (boolean, default false), and `consumed_timestep` (integer) columns.
2FA SHALL be compatible with authenticator apps that implement RFC 6238 TOTP, including Google Authenticator and Authy.
Enabling 2FA SHALL require the user to be already authenticated via password or Google OAuth.
The system SHALL generate a QR code (using `rqrcode`) for the user to scan with their authenticator app during 2FA setup.
The system SHALL verify the user-submitted OTP code against the generated `otp_secret` before activating 2FA.
Once `otp_required_for_login` is true, every subsequent sign-in SHALL require a valid TOTP code after the primary credential step.
The system SHALL prevent OTP code replay attacks by tracking `consumed_timestep`.

#### Scenario: User enables 2FA

- **WHEN** an authenticated user navigates to the 2FA setup page
- **THEN** the system SHALL generate a new `otp_secret` and display a QR code
- **WHEN** the user submits a valid OTP code from their authenticator app
- **THEN** the system SHALL set `otp_required_for_login = true` and save the `otp_secret`

#### Scenario: User submits invalid OTP during 2FA setup

- **WHEN** an authenticated user submits an incorrect OTP code during 2FA setup
- **THEN** the system SHALL NOT activate 2FA and SHALL return an error message "Invalid verification code"

#### Scenario: Sign-in with 2FA enabled

- **WHEN** a user with `otp_required_for_login = true` submits valid primary credentials (password or Google OAuth)
- **THEN** the system SHALL prompt for a TOTP code before completing sign-in
- **WHEN** the user submits a valid TOTP code
- **THEN** the system SHALL complete the sign-in and redirect to the application root

#### Scenario: Sign-in with invalid TOTP code

- **WHEN** a user with 2FA enabled submits an incorrect or expired TOTP code
- **THEN** the system SHALL NOT complete sign-in and SHALL return an error message "Invalid two-factor code"

#### Scenario: OTP code replay prevention

- **WHEN** a user re-submits a TOTP code that was already accepted in the same timestep
- **THEN** the system SHALL reject the code and SHALL NOT complete sign-in

#### Scenario: User disables 2FA

- **WHEN** an authenticated user with 2FA enabled requests to disable 2FA
- **THEN** the system SHALL set `otp_required_for_login = false` and clear `otp_secret`
