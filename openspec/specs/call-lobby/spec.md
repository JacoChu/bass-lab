# call-lobby Specification

## Purpose

TBD - created by archiving change 'bass-lab-realtime-av-system'. Update Purpose after archive.

## Requirements

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


<!-- @trace
source: bass-lab-realtime-av-system
updated: 2026-04-06
code:
  - test/mailers/.keep
  - test/models/.keep
  - app/views/admin/orders/new.html.erb
  - db/migrate/20260405141606_add_omniauth_to_users.rb
  - config/initializers/content_security_policy.rb
  - app/controllers/users/sessions_controller.rb
  - bin/setup
  - test/controllers/api/subscriptions_controller_test.rb
  - test/controllers/api/profile_controller_test.rb
  - config/environments/production.rb
  - frontend/src/main.tsx
  - app/controllers/api/subscriptions_controller.rb
  - frontend/src/pages/OrdersPage.tsx
  - app/controllers/users/omniauth_callbacks_controller.rb
  - app/controllers/application_controller.rb
  - media-server/sdp/sdp.go
  - frontend/src/index.css
  - app/channels/presence_channel.rb
  - frontend/src/App.tsx
  - frontend/src/assets/react.svg
  - app/models/order.rb
  - Gemfile
  - vendor/modules.txt
  - app/controllers/api/invitations_controller.rb
  - app/controllers/api/profile_controller.rb
  - db/migrate/20260405082053_create_users.rb
  - lib/assets/.keep
  - app/views/admin/users/new.html.erb
  - app/controllers/admin/users_controller.rb
  - app/views/admin/admin_users/edit.html.erb
  - app/models/friendship.rb
  - app/views/admin/orders/edit.html.erb
  - frontend/src/assets/hero.png
  - Dockerfile
  - db/migrate/20260405142056_add_devise_two_factor_to_users.rb
  - test/controllers/users/two_factor_controller_test.rb
  - app/controllers/concerns/.keep
  - app/controllers/api/friend_requests_controller.rb
  - frontend/src/pages/FriendList.tsx
  - frontend/public/icons.svg
  - app/models/user.rb
  - frontend/src/App.css
  - db/schema.rb
  - media-server/main.go
  - app/jobs/application_job.rb
  - bin/rake
  - frontend/src/pages/LobbyPage.tsx
  - frontend/tsconfig.json
  - app/views/admin/orders/index.html.erb
  - media-server/signaling/signaling.go
  - app/controllers/api/friends_controller.rb
  - app/controllers/admin/friendships_controller.rb
  - config/initializers/filter_parameter_logging.rb
  - README.md
  - config/initializers/permissions_policy.rb
  - app/views/layouts/admin.html.erb
  - frontend/src/components/DeviceSelector/DeviceSelector.tsx
  - public/apple-touch-icon-precomposed.png
  - config/environments/test.rb
  - .ruby-version
  - bin/rails
  - media-server/sfu/sfu.go
  - test/application_system_test_case.rb
  - app/mailers/application_mailer.rb
  - test/controllers/.keep
  - tmp/restart.txt
  - .spectra.yaml
  - bin/docker-entrypoint
  - app/views/layouts/application.html.erb
  - frontend/src/assets/vite.svg
  - db/cable_schema.rb
  - app/views/admin/orders/show.html.erb
  - frontend/tsconfig.node.json
  - storage/.keep
  - app/controllers/api/sessions_controller.rb
  - app/views/layouts/mailer.text.erb
  - config/database.yml
  - media-server/go.sum
  - app/models/concerns/.keep
  - config/cable.yml
  - app/channels/application_cable/connection.rb
  - db/seeds.rb
  - app/controllers/users/otp_sessions_controller.rb
  - db/migrate/20260405082219_create_orders.rb
  - app/views/layouts/mailer.html.erb
  - config/puma.rb
  - app/assets/stylesheets/application.css
  - app/channels/application_cable/channel.rb
  - app/channels/invitation_channel.rb
  - config/locales/en.yml
  - lib/tasks/.keep
  - config/initializers/assets.rb
  - go.mod
  - main.go
  - frontend/package.json
  - config/locales/devise.en.yml
  - app/helpers/application_helper.rb
  - frontend/src/pages/ProfilePage.tsx
  - .node-version
  - Rakefile
  - frontend/eslint.config.js
  - public/500.html
  - app/controllers/users/two_factor_controller.rb
  - frontend/src/hooks/useAudioPipeline.ts
  - public/robots.txt
  - test/controllers/admin/orders_controller_test.rb
  - media-server/go.mod
  - test/controllers/api/sessions_controller_test.rb
  - test/helpers/.keep
  - config/environments/development.rb
  - config/credentials.yml.enc
  - config/storage.yml
  - frontend/src/test-setup.ts
  - app/controllers/admin/admin_users_controller.rb
  - config/initializers/devise.rb
  - frontend/vite.config.ts
  - public/404.html
  - app/assets/images/.keep
  - app/controllers/admin/orders_controller.rb
  - frontend/README.md
  - app/controllers/api/base_controller.rb
  - config/application.rb
  - log/.keep
  - db/migrate/20260405082136_create_friendships.rb
  - frontend/src/pages/FriendsPage.tsx
  - media-server/signaling/session.go
  - app/controllers/admin/application_controller.rb
  - frontend/tsconfig.app.json
  - app/models/application_record.rb
  - public/422.html
  - Procfile.dev
  - frontend/src/pages/CallPage.tsx
  - app/views/admin/users/show.html.erb
  - config/routes.rb
  - public/favicon.ico
  - test/system/.keep
  - tmp/.keep
  - config/boot.rb
  - config.ru
  - .dockerignore
  - frontend/src/components/Layout/AppLayout.tsx
  - test/controllers/api/invitations_controller_test.rb
  - test/fixtures/files/.keep
  - app/views/admin/users/index.html.erb
  - Gemfile.lock
  - db/migrate/20260405094829_add_subscription_fields_to_orders_and_users.rb
  - test/controllers/users/sessions_controller_test.rb
  - test/controllers/users/omniauth_callbacks_controller_test.rb
  - app/views/admin/users/_form.html.erb
  - app/views/admin/admin_users/index.html.erb
  - config/environment.rb
  - tmp/storage/.keep
  - config/initializers/inflections.rb
  - frontend/public/favicon.svg
  - go.sum
  - node_modules/.vite/vitest/da39a3ee5e6b4b0d3255bfef95601890afd80709/results.json
  - test/channels/application_cable/connection_test.rb
  - frontend/index.html
  - public/apple-touch-icon.png
  - test/integration/.keep
  - app/views/admin/users/edit.html.erb
tests:
  - media-server/signaling/session_test.go
  - test/test_helper.rb
  - frontend/src/pages/FriendList.test.tsx
  - frontend/src/pages/CallPage.test.tsx
  - frontend/src/components/DeviceSelector/DeviceSelector.test.tsx
  - frontend/src/hooks/useAudioPipeline.test.ts
  - frontend/src/pages/FriendsPage.test.tsx
  - media-server/sdp/sdp_test.go
  - frontend/src/App.test.tsx
-->

---
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


<!-- @trace
source: bass-lab-realtime-av-system
updated: 2026-04-06
code:
  - test/mailers/.keep
  - test/models/.keep
  - app/views/admin/orders/new.html.erb
  - db/migrate/20260405141606_add_omniauth_to_users.rb
  - config/initializers/content_security_policy.rb
  - app/controllers/users/sessions_controller.rb
  - bin/setup
  - test/controllers/api/subscriptions_controller_test.rb
  - test/controllers/api/profile_controller_test.rb
  - config/environments/production.rb
  - frontend/src/main.tsx
  - app/controllers/api/subscriptions_controller.rb
  - frontend/src/pages/OrdersPage.tsx
  - app/controllers/users/omniauth_callbacks_controller.rb
  - app/controllers/application_controller.rb
  - media-server/sdp/sdp.go
  - frontend/src/index.css
  - app/channels/presence_channel.rb
  - frontend/src/App.tsx
  - frontend/src/assets/react.svg
  - app/models/order.rb
  - Gemfile
  - vendor/modules.txt
  - app/controllers/api/invitations_controller.rb
  - app/controllers/api/profile_controller.rb
  - db/migrate/20260405082053_create_users.rb
  - lib/assets/.keep
  - app/views/admin/users/new.html.erb
  - app/controllers/admin/users_controller.rb
  - app/views/admin/admin_users/edit.html.erb
  - app/models/friendship.rb
  - app/views/admin/orders/edit.html.erb
  - frontend/src/assets/hero.png
  - Dockerfile
  - db/migrate/20260405142056_add_devise_two_factor_to_users.rb
  - test/controllers/users/two_factor_controller_test.rb
  - app/controllers/concerns/.keep
  - app/controllers/api/friend_requests_controller.rb
  - frontend/src/pages/FriendList.tsx
  - frontend/public/icons.svg
  - app/models/user.rb
  - frontend/src/App.css
  - db/schema.rb
  - media-server/main.go
  - app/jobs/application_job.rb
  - bin/rake
  - frontend/src/pages/LobbyPage.tsx
  - frontend/tsconfig.json
  - app/views/admin/orders/index.html.erb
  - media-server/signaling/signaling.go
  - app/controllers/api/friends_controller.rb
  - app/controllers/admin/friendships_controller.rb
  - config/initializers/filter_parameter_logging.rb
  - README.md
  - config/initializers/permissions_policy.rb
  - app/views/layouts/admin.html.erb
  - frontend/src/components/DeviceSelector/DeviceSelector.tsx
  - public/apple-touch-icon-precomposed.png
  - config/environments/test.rb
  - .ruby-version
  - bin/rails
  - media-server/sfu/sfu.go
  - test/application_system_test_case.rb
  - app/mailers/application_mailer.rb
  - test/controllers/.keep
  - tmp/restart.txt
  - .spectra.yaml
  - bin/docker-entrypoint
  - app/views/layouts/application.html.erb
  - frontend/src/assets/vite.svg
  - db/cable_schema.rb
  - app/views/admin/orders/show.html.erb
  - frontend/tsconfig.node.json
  - storage/.keep
  - app/controllers/api/sessions_controller.rb
  - app/views/layouts/mailer.text.erb
  - config/database.yml
  - media-server/go.sum
  - app/models/concerns/.keep
  - config/cable.yml
  - app/channels/application_cable/connection.rb
  - db/seeds.rb
  - app/controllers/users/otp_sessions_controller.rb
  - db/migrate/20260405082219_create_orders.rb
  - app/views/layouts/mailer.html.erb
  - config/puma.rb
  - app/assets/stylesheets/application.css
  - app/channels/application_cable/channel.rb
  - app/channels/invitation_channel.rb
  - config/locales/en.yml
  - lib/tasks/.keep
  - config/initializers/assets.rb
  - go.mod
  - main.go
  - frontend/package.json
  - config/locales/devise.en.yml
  - app/helpers/application_helper.rb
  - frontend/src/pages/ProfilePage.tsx
  - .node-version
  - Rakefile
  - frontend/eslint.config.js
  - public/500.html
  - app/controllers/users/two_factor_controller.rb
  - frontend/src/hooks/useAudioPipeline.ts
  - public/robots.txt
  - test/controllers/admin/orders_controller_test.rb
  - media-server/go.mod
  - test/controllers/api/sessions_controller_test.rb
  - test/helpers/.keep
  - config/environments/development.rb
  - config/credentials.yml.enc
  - config/storage.yml
  - frontend/src/test-setup.ts
  - app/controllers/admin/admin_users_controller.rb
  - config/initializers/devise.rb
  - frontend/vite.config.ts
  - public/404.html
  - app/assets/images/.keep
  - app/controllers/admin/orders_controller.rb
  - frontend/README.md
  - app/controllers/api/base_controller.rb
  - config/application.rb
  - log/.keep
  - db/migrate/20260405082136_create_friendships.rb
  - frontend/src/pages/FriendsPage.tsx
  - media-server/signaling/session.go
  - app/controllers/admin/application_controller.rb
  - frontend/tsconfig.app.json
  - app/models/application_record.rb
  - public/422.html
  - Procfile.dev
  - frontend/src/pages/CallPage.tsx
  - app/views/admin/users/show.html.erb
  - config/routes.rb
  - public/favicon.ico
  - test/system/.keep
  - tmp/.keep
  - config/boot.rb
  - config.ru
  - .dockerignore
  - frontend/src/components/Layout/AppLayout.tsx
  - test/controllers/api/invitations_controller_test.rb
  - test/fixtures/files/.keep
  - app/views/admin/users/index.html.erb
  - Gemfile.lock
  - db/migrate/20260405094829_add_subscription_fields_to_orders_and_users.rb
  - test/controllers/users/sessions_controller_test.rb
  - test/controllers/users/omniauth_callbacks_controller_test.rb
  - app/views/admin/users/_form.html.erb
  - app/views/admin/admin_users/index.html.erb
  - config/environment.rb
  - tmp/storage/.keep
  - config/initializers/inflections.rb
  - frontend/public/favicon.svg
  - go.sum
  - node_modules/.vite/vitest/da39a3ee5e6b4b0d3255bfef95601890afd80709/results.json
  - test/channels/application_cable/connection_test.rb
  - frontend/index.html
  - public/apple-touch-icon.png
  - test/integration/.keep
  - app/views/admin/users/edit.html.erb
tests:
  - media-server/signaling/session_test.go
  - test/test_helper.rb
  - frontend/src/pages/FriendList.test.tsx
  - frontend/src/pages/CallPage.test.tsx
  - frontend/src/components/DeviceSelector/DeviceSelector.test.tsx
  - frontend/src/hooks/useAudioPipeline.test.ts
  - frontend/src/pages/FriendsPage.test.tsx
  - media-server/sdp/sdp_test.go
  - frontend/src/App.test.tsx
-->

---
### Requirement: Lobby camera preview teardown

When the user navigates away from `/lobby`, all MediaStreamTracks acquired for the preview SHALL be stopped (`.stop()`) to release the camera/microphone hardware.

#### Scenario: Camera released on navigation

- **WHEN** a user navigates away from `/lobby` (e.g., to `/friends`)
- **THEN** all acquired MediaStreamTracks SHALL be stopped
- **THEN** the camera indicator light SHALL turn off

<!-- @trace
source: bass-lab-realtime-av-system
updated: 2026-04-06
code:
  - test/mailers/.keep
  - test/models/.keep
  - app/views/admin/orders/new.html.erb
  - db/migrate/20260405141606_add_omniauth_to_users.rb
  - config/initializers/content_security_policy.rb
  - app/controllers/users/sessions_controller.rb
  - bin/setup
  - test/controllers/api/subscriptions_controller_test.rb
  - test/controllers/api/profile_controller_test.rb
  - config/environments/production.rb
  - frontend/src/main.tsx
  - app/controllers/api/subscriptions_controller.rb
  - frontend/src/pages/OrdersPage.tsx
  - app/controllers/users/omniauth_callbacks_controller.rb
  - app/controllers/application_controller.rb
  - media-server/sdp/sdp.go
  - frontend/src/index.css
  - app/channels/presence_channel.rb
  - frontend/src/App.tsx
  - frontend/src/assets/react.svg
  - app/models/order.rb
  - Gemfile
  - vendor/modules.txt
  - app/controllers/api/invitations_controller.rb
  - app/controllers/api/profile_controller.rb
  - db/migrate/20260405082053_create_users.rb
  - lib/assets/.keep
  - app/views/admin/users/new.html.erb
  - app/controllers/admin/users_controller.rb
  - app/views/admin/admin_users/edit.html.erb
  - app/models/friendship.rb
  - app/views/admin/orders/edit.html.erb
  - frontend/src/assets/hero.png
  - Dockerfile
  - db/migrate/20260405142056_add_devise_two_factor_to_users.rb
  - test/controllers/users/two_factor_controller_test.rb
  - app/controllers/concerns/.keep
  - app/controllers/api/friend_requests_controller.rb
  - frontend/src/pages/FriendList.tsx
  - frontend/public/icons.svg
  - app/models/user.rb
  - frontend/src/App.css
  - db/schema.rb
  - media-server/main.go
  - app/jobs/application_job.rb
  - bin/rake
  - frontend/src/pages/LobbyPage.tsx
  - frontend/tsconfig.json
  - app/views/admin/orders/index.html.erb
  - media-server/signaling/signaling.go
  - app/controllers/api/friends_controller.rb
  - app/controllers/admin/friendships_controller.rb
  - config/initializers/filter_parameter_logging.rb
  - README.md
  - config/initializers/permissions_policy.rb
  - app/views/layouts/admin.html.erb
  - frontend/src/components/DeviceSelector/DeviceSelector.tsx
  - public/apple-touch-icon-precomposed.png
  - config/environments/test.rb
  - .ruby-version
  - bin/rails
  - media-server/sfu/sfu.go
  - test/application_system_test_case.rb
  - app/mailers/application_mailer.rb
  - test/controllers/.keep
  - tmp/restart.txt
  - .spectra.yaml
  - bin/docker-entrypoint
  - app/views/layouts/application.html.erb
  - frontend/src/assets/vite.svg
  - db/cable_schema.rb
  - app/views/admin/orders/show.html.erb
  - frontend/tsconfig.node.json
  - storage/.keep
  - app/controllers/api/sessions_controller.rb
  - app/views/layouts/mailer.text.erb
  - config/database.yml
  - media-server/go.sum
  - app/models/concerns/.keep
  - config/cable.yml
  - app/channels/application_cable/connection.rb
  - db/seeds.rb
  - app/controllers/users/otp_sessions_controller.rb
  - db/migrate/20260405082219_create_orders.rb
  - app/views/layouts/mailer.html.erb
  - config/puma.rb
  - app/assets/stylesheets/application.css
  - app/channels/application_cable/channel.rb
  - app/channels/invitation_channel.rb
  - config/locales/en.yml
  - lib/tasks/.keep
  - config/initializers/assets.rb
  - go.mod
  - main.go
  - frontend/package.json
  - config/locales/devise.en.yml
  - app/helpers/application_helper.rb
  - frontend/src/pages/ProfilePage.tsx
  - .node-version
  - Rakefile
  - frontend/eslint.config.js
  - public/500.html
  - app/controllers/users/two_factor_controller.rb
  - frontend/src/hooks/useAudioPipeline.ts
  - public/robots.txt
  - test/controllers/admin/orders_controller_test.rb
  - media-server/go.mod
  - test/controllers/api/sessions_controller_test.rb
  - test/helpers/.keep
  - config/environments/development.rb
  - config/credentials.yml.enc
  - config/storage.yml
  - frontend/src/test-setup.ts
  - app/controllers/admin/admin_users_controller.rb
  - config/initializers/devise.rb
  - frontend/vite.config.ts
  - public/404.html
  - app/assets/images/.keep
  - app/controllers/admin/orders_controller.rb
  - frontend/README.md
  - app/controllers/api/base_controller.rb
  - config/application.rb
  - log/.keep
  - db/migrate/20260405082136_create_friendships.rb
  - frontend/src/pages/FriendsPage.tsx
  - media-server/signaling/session.go
  - app/controllers/admin/application_controller.rb
  - frontend/tsconfig.app.json
  - app/models/application_record.rb
  - public/422.html
  - Procfile.dev
  - frontend/src/pages/CallPage.tsx
  - app/views/admin/users/show.html.erb
  - config/routes.rb
  - public/favicon.ico
  - test/system/.keep
  - tmp/.keep
  - config/boot.rb
  - config.ru
  - .dockerignore
  - frontend/src/components/Layout/AppLayout.tsx
  - test/controllers/api/invitations_controller_test.rb
  - test/fixtures/files/.keep
  - app/views/admin/users/index.html.erb
  - Gemfile.lock
  - db/migrate/20260405094829_add_subscription_fields_to_orders_and_users.rb
  - test/controllers/users/sessions_controller_test.rb
  - test/controllers/users/omniauth_callbacks_controller_test.rb
  - app/views/admin/users/_form.html.erb
  - app/views/admin/admin_users/index.html.erb
  - config/environment.rb
  - tmp/storage/.keep
  - config/initializers/inflections.rb
  - frontend/public/favicon.svg
  - go.sum
  - node_modules/.vite/vitest/da39a3ee5e6b4b0d3255bfef95601890afd80709/results.json
  - test/channels/application_cable/connection_test.rb
  - frontend/index.html
  - public/apple-touch-icon.png
  - test/integration/.keep
  - app/views/admin/users/edit.html.erb
tests:
  - media-server/signaling/session_test.go
  - test/test_helper.rb
  - frontend/src/pages/FriendList.test.tsx
  - frontend/src/pages/CallPage.test.tsx
  - frontend/src/components/DeviceSelector/DeviceSelector.test.tsx
  - frontend/src/hooks/useAudioPipeline.test.ts
  - frontend/src/pages/FriendsPage.test.tsx
  - media-server/sdp/sdp_test.go
  - frontend/src/App.test.tsx
-->