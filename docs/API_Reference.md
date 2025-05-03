# API Reference

This page lists the main API endpoints and what they do.

## Authentication
- **POST /api/auth/login**  
  Log in a user.  
  **Body:** `{ email, password }`  
  **Returns:** User session data.

- **POST /api/auth/logout**  
  Log out the current user.  
  **Returns:** Redirect to home.

## Budget Limits
- **GET /api/limits**  
  Get all budget limits for the user.  
  **Returns:** Array of limits with current spending.

- **POST /api/limits**  
  Create a new budget limit.  
  **Body:**  
  ```json
  {
    "description": "Don’t spend more than €50 on takeaways this week",
    "strictnessValue": 5
  }
  

**Returns:** The new limit object.

* **GET /api/limits/\:id**
  Get details for one limit.
  **URL Params:** `id` = limit ID
  **Returns:** Limit details and last 10 transactions.

* **DELETE /api/limits/\:id**
  Delete a budget limit.
  **URL Params:** `id` = limit ID
  **Returns:** `{ success: true }`

## Account & Daily Limit

* **PUT /api/account/daily-limit**
  Set a daily spending limit on the Bunq card.
  **Body:** `{ amount: number }`
  **Returns:** Redirect to dashboard.

* **GET /api/account**
  Get account info (balance & daily limit).
  **Returns:**

  ```json
  {
    "balance": 123.45,
    "dailyLimit": 50,
    "accountId": "...",
    "externalId": "..."
  }
  ```

## AI & Override

* **POST /api/limits/\:id/override**
  Ask AI to unblock card after limit block.
  **URL Params:** `id` = limit ID
  **Body:** `{ reason: string }`
  **Returns:** AI decision and new block status.
