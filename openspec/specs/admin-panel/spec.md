# admin-panel Specification

## Purpose

TBD - created by archiving change 'bass-lab-realtime-av-system'. Update Purpose after archive.

## Requirements

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
### Requirement: User detail view with friends and orders

The system SHALL display on each user's show page (`/admin/users/:id`): (1) a list of accepted friends showing `display_name` for each friendship where `user_id = id OR friend_id = id AND status = accepted`; (2) a list of that user's orders showing `id`, `status`, `period`, `expires_at`, each row linkable to `/admin/orders/:order_id`.

#### Scenario: Admin views a user's accepted friends

- **WHEN** a super_admin visits `/admin/users/:id`
- **THEN** the show page SHALL render a "Friends" section listing all accepted friendships (display_name of the other party); if the user has no accepted friends the section SHALL render empty

#### Scenario: Admin navigates from user to order

- **WHEN** a super_admin visits `/admin/users/:id` and clicks an order row
- **THEN** the system SHALL navigate to `/admin/orders/:order_id` showing that order's details


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