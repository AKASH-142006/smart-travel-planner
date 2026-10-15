# Smart Travel Planner

Smart Planning for the Modern Traveler — a web-based travel planning demo covering 4 core modules.

## Project Structure

```
smart-travel-planner/
├── client/             # Browser application served by Express
│   ├── index.html      # Main page (all 4 module tabs)
│   ├── login.html
│   ├── register.html
│   ├── css/style.css   # All styling
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
| 1 | User Authentication | SCRUM-1 | Register, Login, Logout with validation (localStorage-based) |
| 2 | Destination Discovery | SCRUM-17 | Search/filter destinations, view details & top attractions |
| 3 | Budget & Expense Tracker | SCRUM-3 | Set a budget, break down expenses by category, over-budget warning |
| 4 | Map & Weather | SCRUM-4 | Live interactive map (OpenStreetMap) + live weather (Open-Meteo API) |

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

## Notes for Reviewers

- User accounts and saved trips are stored in MySQL through the Express backend. The client retains a localStorage fallback when the API is unavailable.
- Destination data is currently seeded/static (6 sample destinations) to keep the demo self-contained; a production version would pull from a destinations database or third-party travel API.
- This covers the 4 modules prioritized for the first project review. Remaining modules (Itinerary Generator, Hotel/Transport Search, Reviews, Notifications) are tracked in the Jira backlog for upcoming sprints.

## Next Steps (Post-Review)

- Build the Itinerary Generator module (auto-generate day-by-day plans)
- Add Hotel and Transportation search
- Add Reviews & Ratings and Notifications modules
