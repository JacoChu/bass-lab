## ADDED Requirements

### Requirement: User order history page

An `OrdersPage` component SHALL be accessible at route `/orders`.
The page SHALL call `GET /api/subscriptions` on mount to retrieve the user's order list.
Each order SHALL display: id, period (Monthly / Yearly), amount (formatted as currency), status (confirmed / cancelled), expires_at (formatted as YYYY-MM-DD), created_at (formatted as YYYY-MM-DD).
When the order list is empty, the page SHALL display "目前沒有訂閱紀錄".

#### Scenario: Orders page shows list

- **WHEN** a user navigates to `/orders`
- **THEN** `GET /api/subscriptions` SHALL be called
- **THEN** each order SHALL be displayed with id, period, amount, status, expires_at, created_at

#### Scenario: Empty orders page

- **WHEN** the user has no orders
- **THEN** the page SHALL display "目前沒有訂閱紀錄"

### Requirement: Subscription and trial status summary

The top of the orders page SHALL display a summary panel.
If the user has at least one `confirmed` order with `expires_at > now`: display "訂閱中：有效至 YYYY-MM-DD" using the latest `expires_at`.
If no active subscription: display "目前無有效訂閱".
Always display: "免費試用：已使用 N / 2 次" where N is `trial_sessions_used` from `GET /api/profile`.

#### Scenario: Active subscription shown at top

- **WHEN** the user has a confirmed order with expires_at in the future
- **THEN** the summary SHALL display "訂閱中：有效至 YYYY-MM-DD"

#### Scenario: Trial usage shown

- **WHEN** the user has used 1 of 2 free trial sessions
- **THEN** the summary SHALL display "免費試用：已使用 1 / 2 次"

#### Scenario: No subscription shown

- **WHEN** the user has no confirmed active orders
- **THEN** the summary SHALL display "目前無有效訂閱"

### Requirement: Cancel subscription

Each order with `status = "confirmed"` SHALL display a "取消訂閱" button.
Clicking the button SHALL show a confirmation dialog with text "確定要取消此訂閱嗎？取消後無法復原。"
If confirmed, the frontend SHALL call `DELETE /api/subscriptions/:id`.
On success (HTTP 200), the order row SHALL update its status to "cancelled" without a full page reload.
On failure (HTTP 404 or other), the frontend SHALL display an error alert.

#### Scenario: Cancel subscription success

- **WHEN** the user clicks "取消訂閱" and confirms the dialog
- **THEN** `DELETE /api/subscriptions/:id` SHALL be called
- **THEN** the order row SHALL show status "cancelled"
- **THEN** the "取消訂閱" button SHALL be removed from that row
