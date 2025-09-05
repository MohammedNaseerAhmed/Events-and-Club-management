# College Clubs & Events API (Node.js/Express/MongoDB)

## Getting Started

1. Copy .env.example to .env and set values
2. Install deps: `npm install`
3. Run dev server: `npm run dev`

## Env Variables
- MONGO_URI
- JWT_SECRET
- PORT (default 5000)
- CORS_ORIGIN (frontend origin)

## Core Endpoints
- Auth: POST /api/auth/register, /api/auth/login, /api/auth/logout
- User: GET/PATCH /api/user/me
- Events: CRUD (admin), GET /api/events?query..., GET /api/events/feed/upcoming, POST /api/events/:id/register
- Clubs: CRUD (admin), GET /api/clubs, GET /api/clubs/:id/events
- Notifications: CRUD (admin), GET /api/notifications/feed/recent
- Calendar: GET /api/calendar/monthly?year=YYYY&month=0-11
- Uploads: POST /api/upload/event-poster, /api/upload/club-logo

All JSON responses use `{ success, data|error }` structure.