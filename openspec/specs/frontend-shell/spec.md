# frontend-shell Specification

## Purpose

TBD - created by archiving change 'bass-lab-realtime-av-system'. Update Purpose after archive.

## Requirements

### Requirement: App Shell with persistent Nav Bar

The React SPA SHALL use DaisyUI as its UI component library, installed via npm (`daisyui`).
The `tailwind.config.js` (or Vite Tailwind plugin configuration) SHALL include DaisyUI as a plugin.
An `AppLayout` component SHALL wrap all authenticated pages and render a persistent top Nav Bar plus a `<Outlet>` content area.
The Nav Bar SHALL be fixed at the top of the viewport on all pages except `/call/:token` (call page is full-screen without nav).
The Nav Bar SHALL contain, from left to right:
  1. Bass-Lab brand name / logo (links to `/lobby`)
  2. Navigation links: 好友（`/friends`）、訂單（`/orders`）
  3. 快速通話 button linking to `/lobby`
  4. Dark/light mode toggle button (sun/moon icon)
  5. User avatar / display_name dropdown (links: 個人資料 → `/profile`, 登出 → `DELETE /users/sign_out`)

#### Scenario: Nav Bar visible on friends page

- **WHEN** a user navigates to `/friends`
- **THEN** the Nav Bar SHALL be rendered at the top of the viewport
- **THEN** links to `/friends`, `/orders`, and `/lobby` SHALL be visible

#### Scenario: Nav Bar is absent on call page

- **WHEN** a user is on `/call/:token`
- **THEN** the Nav Bar SHALL NOT be rendered
- **THEN** the call page SHALL occupy the full viewport


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
### Requirement: Dark/light mode toggle

The application SHALL support two themes: `light` and `dark`, using DaisyUI's built-in theme system.
The active theme SHALL be applied by setting the `data-theme` attribute on the `<html>` element.
The user's theme preference SHALL be persisted in `localStorage` under the key `"theme"`.
On initial page load, the application SHALL read `localStorage["theme"]` and apply it; if absent, default to `"light"`.
Clicking the toggle button SHALL immediately switch the theme and update `localStorage`.
The toggle button SHALL display a sun icon when in dark mode (click to switch to light) and a moon icon when in light mode (click to switch to dark).

#### Scenario: First visit defaults to light theme

- **WHEN** a user visits the app for the first time with no localStorage entry
- **THEN** `<html data-theme="light">` SHALL be set
- **THEN** the Nav Bar SHALL show a moon icon (indicating light mode is active)

#### Scenario: User switches to dark mode

- **WHEN** a user clicks the theme toggle button while in light mode
- **THEN** `<html data-theme="dark">` SHALL be set immediately
- **THEN** `localStorage["theme"]` SHALL be set to `"dark"`
- **THEN** the toggle icon SHALL change to sun

#### Scenario: Theme persists across page reload

- **WHEN** a user has previously selected dark mode and reloads the page
- **THEN** `<html data-theme="dark">` SHALL be applied before first render

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