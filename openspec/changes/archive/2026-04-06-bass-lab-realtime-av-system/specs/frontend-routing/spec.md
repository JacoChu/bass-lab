## ADDED Requirements

### Requirement: SPA client-side routing

The React SPA SHALL use `react-router-dom` for client-side routing.
`frontend/package.json` SHALL include `react-router-dom` as a runtime dependency.
`frontend/src/App.tsx` SHALL define all routes using `<BrowserRouter>` and `<Routes>` from `react-router-dom`, replacing the Vite default boilerplate.
The root path `/` SHALL redirect to `/friends`.
The path `/friends` SHALL render the `<FriendsPage>` component.
The path `/call/:token` SHALL render the `<CallPage>` component, with `token` accessible via `useParams()`.
All page components SHALL be located under `frontend/src/pages/`.
Inter-page navigation SHALL use `useNavigate()` from `react-router-dom` and SHALL NOT use `window.location` assignment.

#### Scenario: User visits root URL

- **WHEN** a user navigates to `/`
- **THEN** the browser SHALL be redirected to `/friends`
- **THEN** the friend list page SHALL be rendered

#### Scenario: User navigates to friends page directly

- **WHEN** a user navigates to `/friends`
- **THEN** the `<FriendsPage>` component SHALL be rendered
- **THEN** no blank screen or 404 SHALL occur

#### Scenario: User navigates to call page with token

- **WHEN** a user navigates to `/call/abc123`
- **THEN** the `<CallPage>` component SHALL be rendered
- **THEN** `useParams()` SHALL return `{ token: "abc123" }`

#### Scenario: Application programmatically navigates to call page

- **WHEN** a call invitation is accepted and the application navigates to the call page
- **THEN** `useNavigate("/call/:token")` SHALL be used
- **THEN** the URL in the browser SHALL change to `/call/:token` without a full page reload
