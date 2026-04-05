## ADDED Requirements

### Requirement: Google OAuth login

The system SHALL allow users to authenticate using their Google account via OAuth 2.0.
The system SHALL integrate `omniauth-google-oauth2` with Devise omniauthable.
The `users` table SHALL include `provider` (string) and `uid` (string) columns to store the OAuth identity.
When a user signs in via Google for the first time, the system SHALL create a new User record with `provider = "google_oauth2"` and `uid` set to the Google account's unique identifier.
When a user signs in via Google and a matching `uid` already exists, the system SHALL sign in the existing user without creating a duplicate record.
The system SHALL protect OmniAuth callback routes against CSRF attacks using `omniauth-rails_csrf_protection`.
Users created via Google OAuth SHALL NOT require a password (`encrypted_password` is not required to be set and SHALL be populated with a random token via `Devise.friendly_token`).
The `display_name` SHALL be populated from the Google profile `name` field on first sign-in.

#### Scenario: New user signs in with Google

- **WHEN** a user visits the sign-in page and clicks "Sign in with Google"
- **THEN** the system SHALL redirect the user to Google's OAuth consent screen
- **THEN** after successful Google authorization, the system SHALL create a new User record with `provider = "google_oauth2"`, `uid` from Google, `display_name` from Google profile
- **THEN** the system SHALL sign in the user and redirect to the application root

#### Scenario: Returning user signs in with Google

- **WHEN** a user who previously signed in via Google revisits and clicks "Sign in with Google"
- **THEN** the system SHALL find the existing user by `provider` and `uid`
- **THEN** the system SHALL sign in the user without creating a duplicate record

#### Scenario: OAuth callback with invalid state (CSRF protection)

- **WHEN** an OAuth callback request arrives without a valid CSRF state parameter
- **THEN** the system SHALL return HTTP 422 and NOT create or sign in any user

#### Scenario: Google account email already registered as password account

- **WHEN** a user attempts Google OAuth sign-in and the Google email matches an existing user whose `provider` is nil (password-based account)
- **THEN** the system SHALL sign in the existing user and link the Google identity by setting `provider` and `uid`
