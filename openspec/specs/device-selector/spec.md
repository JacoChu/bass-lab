# device-selector Specification

## Purpose

TBD - created by archiving change 'bass-lab-realtime-av-system'. Update Purpose after archive.

## Requirements

### Requirement: Enumerate available media devices

The system SHALL call `navigator.mediaDevices.enumerateDevices()` to retrieve the list of available audio input (`audioinput`) and video input (`videoinput`) devices. The enumeration SHALL be triggered on component mount and each time the user grants or changes device permissions. Each device entry SHALL display its `label` (or a fallback label of `"Microphone <index>"` / `"Camera <index>"` if `label` is empty due to permission not yet granted).

#### Scenario: Devices are enumerated on component mount

- **WHEN** the DeviceSelector component mounts
- **THEN** the system calls `enumerateDevices()` and populates two dropdown menus: one for `audioinput` devices and one for `videoinput` devices

#### Scenario: Device label is empty before permission granted

- **WHEN** `enumerateDevices()` returns an `audioinput` device with an empty `label`
- **THEN** the dropdown renders the entry as "Microphone 1" (using 1-based index)

#### Scenario: Device list refreshes after permission granted

- **WHEN** the user grants microphone permission through the browser permission dialog
- **THEN** the system re-calls `enumerateDevices()` and updates the dropdown to show actual device labels


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
### Requirement: Select specific audio input device by deviceId

The system SHALL allow the user to select a specific audio input device from the dropdown. The selected `deviceId` SHALL be stored in component state. When the user confirms their device selection, the system SHALL call `getUserMedia` with `audio: { deviceId: { exact: <selectedDeviceId> } }` to open the stream from the chosen device.

#### Scenario: User selects a specific audio interface channel

- **WHEN** the user opens the audio input dropdown and selects "Focusrite USB Audio (deviceId: abc123)"
- **THEN** the system stores `selectedAudioDeviceId = "abc123"` in state

#### Scenario: getUserMedia uses the exact selected deviceId

- **WHEN** the user confirms their device selection
- **THEN** the system calls `navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: "abc123" }, ... }, video: { deviceId: { exact: <videoDeviceId> } } })`

#### Scenario: Requested deviceId is no longer available

- **WHEN** `getUserMedia` fails with `OverconstrainedError` because the selected `deviceId` no longer exists
- **THEN** the system displays an error message "Selected device is no longer available. Please choose another." and re-renders the device selector


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
### Requirement: Select specific video input device by deviceId

The system SHALL allow the user to select a specific video input device from the `videoinput` dropdown. The selected `deviceId` SHALL be passed to `getUserMedia` via `video: { deviceId: { exact: <selectedDeviceId> } }`.

#### Scenario: User selects a webcam from the video input dropdown

- **WHEN** the user selects a video device with `deviceId: "cam456"` from the video dropdown
- **THEN** the system stores `selectedVideoDeviceId = "cam456"` in state and uses it on the next `getUserMedia` call

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