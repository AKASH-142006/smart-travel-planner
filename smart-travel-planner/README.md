# Smart Travel Planner

Smart Planning for the Modern Traveler — a web-based travel planner with trip discovery, budgeting, saved itineraries, reviews, and notifications.

## Project Structure

```
smart-travel-planner/
├── client/             # Browser application served by Express
│   ├── index.html      # Main page and feature tabs
│   ├── login.html
│   ├── register.html
│   ├── css/style.css   # Shared application styling
│   ├── css/features.css # Review and notification styling
│   ├── js/app.js       # All client-side logic
│   └── assets/         # Local destination images
├── server/             # Private backend application
│   ├── server.js       # Express API and static file server
│   └── db.js           # MySQL initialization and connection pool
├── .env.example        # Environment variable template
├── package.json
└── README.md
```

## Modules Implemented

| # | Module | Maps to Jira Epic | Description |
|---|--------|-------------------|--------------|
| 1 | User Authentication | SCRUM-1 | Register and login with MySQL accounts and expiring API sessions |
| 2 | Destination Discovery | SCRUM-17 | Search/filter destinations, view details & top attractions |
| 3 | Budget & Expense Tracker | SCRUM-3 | Set a budget, break down expenses by category, over-budget warning |
| 4 | Map & Weather | SCRUM-4 | Live interactive map (OpenStreetMap) + live weather (Open-Meteo API) |
| 5 | Reviews | — | Reviews for completed approved bookings, with live summaries, filtering, and sorting |
| 6 | Travel Notifications | — | In-app booking updates, trip and itinerary reminders, budget alerts, and review reminders |

## How to Run

Install dependencies and start the combined client/server deployment:

```bash
npm install
npm start
```

Then visit `http://localhost:5000`. Configure the MySQL connection in `.env` using `.env.example` as a template. The client calls the API through same-origin `/api` routes, so the same setup works locally and in production.

## APIs Used (both free, no API key required)

- **Open-Meteo** — live weather forecast: https://open-meteo.com
- **OpenStreetMap** — embedded map view: https://www.openstreetmap.org

## Notes

- User accounts and saved trips are stored in MySQL through the Express backend. The client retains a localStorage fallback for legacy planning behavior when the API is unavailable; reviews and notifications require an authenticated backend session.
- Destination data is currently seeded/static (6 sample destinations) to keep the demo self-contained; a production version would pull from a destinations database or third-party travel API.
- Review content is never seeded in the client; public listings and summaries are calculated from saved reviews.

## Reviews and notifications

The review and in-app notification features use real MySQL records; no production review content is hardcoded in the client. On startup, the backend safely creates `user_sessions`, `reviews`, and `notifications` and adds missing date columns to existing `bookings` tables. Existing tables and records are not dropped.

Set `TZ=Asia/Kolkata` (or the intended IANA time zone) in `.env` when reminders should follow a particular server time zone. Date-based notifications run once after database initialization and then every 15 minutes. Unique notification keys make repeated jobs and restarts idempotent. Upcoming trip reminders are generated only for approved bookings; itinerary and post-trip reminders use stored trip dates.

The login API issues a random, expiring 30-day bearer session. Sign out and sign back in after updating an existing installation to receive a session token. The administrator must also log in again before approving bookings; approvals trigger the booking-confirmation notification.

### APIs

- `GET /api/reviews/eligible-bookings` — authenticated user's completed, approved bookings available for review
- `POST /api/reviews` — authenticated review submission; one destination and one hotel review per booking
- `GET /api/reviews/targets` — available booking, destination, hotel, and existing review targets
- `GET /api/reviews?targetType=destination&targetName=Goa&rating=5&sort=newest&page=1`
- `GET /api/reviews/summary?targetType=destination&targetName=Goa`
- `GET /api/notifications` and `GET /api/notifications/unread-count`
- `PATCH /api/notifications/:id/read` and `PATCH /api/notifications/read-all`

### Verify stored records

After using the features, inspect the configured database with:

```sql
SELECT id, user_id, booking_id, target_type, target_name, rating, title, created_at
FROM reviews ORDER BY created_at DESC;
SELECT id, user_id, title, notification_type, is_read, booking_id, planned_trip_id, created_at
FROM notifications ORDER BY created_at DESC;
```
