## ADDED Requirements

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
