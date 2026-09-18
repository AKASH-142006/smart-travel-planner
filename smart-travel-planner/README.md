# Smart Travel Planner

Smart Planning for the Modern Traveler — a web-based travel planning demo covering 4 core modules.

## Project Structure

```
smart-travel-planner/
├── index.html          # Main page (all 4 module tabs)
├── css/
│   └── style.css       # All styling
├── js/
│   └── app.js          # All application logic
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

No build tools or installation required.

1. Open `index.html` directly in any modern browser (Chrome, Edge, Firefox), **or**
2. Serve it locally for full functionality (recommended, since some browsers restrict fetch() on `file://` pages):
   ```bash
   cd smart-travel-planner
   python3 -m http.server 8000
   ```
   Then visit `http://localhost:8000` in your browser.

## APIs Used (both free, no API key required)

- **Open-Meteo** — live weather forecast: https://open-meteo.com
- **OpenStreetMap** — embedded map view: https://www.openstreetmap.org

## Notes for Reviewers

- User data (accounts) is stored in the browser's localStorage for demo purposes — a production version would use a real backend and database.
- Destination data is currently seeded/static (6 sample destinations) to keep the demo self-contained; a production version would pull from a destinations database or third-party travel API.
- This covers the 4 modules prioritized for the first project review. Remaining modules (Itinerary Generator, Hotel/Transport Search, Reviews, Notifications) are tracked in the Jira backlog for upcoming sprints.

## Next Steps (Post-Review)

- Connect a real backend (Node.js/Express or Firebase) for persistent user accounts and trip data
- Build the Itinerary Generator module (auto-generate day-by-day plans)
- Add Hotel and Transportation search
- Add Reviews & Ratings and Notifications modules
