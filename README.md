# Event Booking API

A RESTful API for managing events, user authentication, RSVPs, and admin controls, built with Node.js, Express, and Firebase Firestore.

## Features
- User signup and authentication (Firebase Auth)
- Event creation, update, deletion (admin only)
- Public event listing and details
- RSVP to events (with seat limits)
- View your RSVPed events
- Admin user management

## Prerequisites
- Node.js (v14+ recommended)
- Firebase project with service account credentials

## Setup
1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd EventBookingApi
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Firebase Service Account:**
   - Place your `serviceAccountKey.json` file in the root directory (not committed to version control).
4. **Environment Variables:**
   - Create a `.env` file in the root directory:
     ```env
     PORT=3000
     ```
5. **Start the server:**
   ```bash
   npm start
   ```

## Scripts
- `npm start` — Start the API server
- `node scripts/setAdmin.js <uid>` — Grant admin rights to a user by UID

## API Endpoints

### Auth
- `POST /auth/signup` — Register a new user
  - Body: `{ email, password, displayName? }`
- `GET /auth/me` — Get current user info (requires Bearer token)

### Events
- `GET /events` — List all events (public)
- `GET /events/:id` — Get event details (public)
- `POST /events` — Create event (admin only)
- `PUT /events/:id` — Update event (admin only)
- `DELETE /events/:id` — Delete event (admin only)

### RSVP
- `POST /events/:id/rsvp` — RSVP to an event (requires auth)
- `DELETE /events/:id/rsvp` — Cancel RSVP (requires auth)
- `GET /my-events` — List events the user has RSVPed to (requires auth)

## Authentication
- All protected routes require a Firebase ID token in the `Authorization: Bearer <token>` header.
- Admin routes require the user to have a custom claim `{ admin: true }`.

## Granting Admin Rights
To make a user an admin, run:
```bash
node scripts/setAdmin.js <uid>
```

## Project Structure
- `app.js` — Main entry point
- `routes/` — Route handlers (auth, events, rsvp)
- `middleware/` — Auth and admin middleware
- `services/` — Firebase initialization
- `scripts/` — Utility scripts (e.g., setAdmin)

## Security Notes
- **Never commit `serviceAccountKey.json` to version control.**
- Use environment variables for sensitive configuration.

## License
MIT 