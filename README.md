# Student Internship Portal

A full-stack MERN (MongoDB, Express, React, Node.js) portal where students can browse
open internships, read the details of a role, and submit an application. The Express API
validates every submission, stores applications in MongoDB, and exposes REST endpoints
for both internships and applications.

## Features

- **Internship catalogue** — responsive cards with company, location, work mode, stipend,
  duration, skills and deadline.
- **React routing** — list (`/`), details (`/internships/:id`) and application
  (`/internships/:id/apply`) pages, plus an application tracker (`/applications`).
- **Validated application form** — client-side validation for name, email, roll number and
  internship; server-side validation mirrors the same rules.
- **Fetch-based submission** — the form uses `fetch()` and renders success or error
  messages, including field-level errors returned by the API.
- **Async REST API** — Express routes use `async/await`, a shared async wrapper and a central
  error handler for validation, cast and duplicate-key errors.
- **Mongoose models** — `Internship` and `Application` schemas, with a unique
  `(email, internship)` index to prevent duplicate applications.
- **Environment-driven MongoDB** — the connection string is read from `MONGO_DB_URI`.
- **Seeded demo data** — six internships are inserted automatically on first startup.

## Tech stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Frontend | React 18, React Router 6, Vite, plain CSS    |
| Backend  | Node.js, Express 4                           |
| Database | MongoDB with Mongoose 8                      |
| Deploy   | Vercel (frontend), Render (backend)          |

## Project structure

```text
.
├── index.js                  # Express app, MongoDB connection, error handler
├── routes/api.js             # REST endpoints (async/await)
├── models/
│   ├── internship.js         # Internship schema
│   └── application.js        # Application schema + unique index
├── data/internships.js       # Seed catalogue
├── utils/
│   ├── ApiError.js
│   ├── asyncHandler.js
│   ├── seedInternships.js
│   └── validateApplication.js
├── scripts/seed.js           # npm run seed
├── client/
│   ├── src/pages/            # List, details, application form, tracker
│   ├── src/components/       # Navbar, cards, loading/error feedback
│   ├── src/api.js            # fetch wrapper + API URL configuration
│   └── vercel.json           # SPA rewrites for Vercel
├── render.yaml               # Render blueprint
└── Procfile                  # Railway/Heroku start command
```

## Local setup

### 1. Prerequisites

- Node.js 18 or newer
- A MongoDB database (local MongoDB or MongoDB Atlas)

### 2. Install dependencies

```bash
npm run setup
```

### 3. Configure environment variables

```bash
cp env-example .env
```

Edit `.env`:

```dotenv
MONGO_DB_URI=mongodb://localhost:27017/student_internship_portal
CLIENT_ORIGIN=http://localhost:5173
PORT=5000
NODE_ENV=development
```

The frontend uses the Vite proxy in development, so no client env file is needed.
For a standalone frontend build, copy `client/.env.example` to `client/.env` and set
`VITE_API_URL` to the backend origin.

### 4. Run the app

```bash
npm run dev
```

- Frontend: <http://localhost:5173>
- API: <http://localhost:5000/api>

To run the services separately:

```bash
npm run server   # Express API with nodemon
npm run client   # Vite dev server
```

The first API start seeds six internships. To refresh the catalogue (and deadlines):

```bash
npm run seed
```

## API reference

Base URL: `/api`

| Method | Endpoint              | Description                                        |
| ------ | --------------------- | -------------------------------------------------- |
| GET    | `/health`             | Health probe (database state + uptime)              |
| GET    | `/internships`        | List active internships (`?search=`, `?mode=`)      |
| GET    | `/internships/:id`    | Get one internship                                  |
| POST   | `/applications`       | Create an application                               |
| GET    | `/applications`       | List applications (`?internship=`, `?email=`, `?status=`) |
| GET    | `/applications/:id`   | Get one application                                 |

### Create an application

```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ananya Sharma",
    "email": "ananya@college.edu",
    "rollNumber": "22CS1042",
    "internship": "<internship ObjectId>"
  }'
```

Success (`201`):

```json
{
  "message": "Application submitted successfully",
  "application": {
    "_id": "...",
    "name": "Ananya Sharma",
    "email": "ananya@college.edu",
    "rollNumber": "22CS1042",
    "status": "submitted",
    "internship": { "title": "Frontend Developer Intern", "company": "Nimbus Labs" },
    "createdAt": "..."
  }
}
```

Validation error (`400`):

```json
{
  "message": "Please correct the highlighted fields",
  "errors": [{ "field": "email", "message": "Please enter a valid email ID (for example, student@college.edu)" }]
}
```

Other status codes: `404` when an internship is missing/closed, `409` when the same email
already applied to the same internship, `500` for unexpected failures.

### Validation rules

| Field        | Rule                                                                 |
| ------------ | -------------------------------------------------------------------- |
| `name`       | 2–80 characters, letters/spaces/dots/hyphens/apostrophes             |
| `email`      | Valid email address, stored lowercase                                |
| `rollNumber` | 3–20 characters: letters, numbers, `-`, `_`, `/`; stored uppercase    |
| `internship` | Required, valid MongoDB ObjectId, internship must be active and open |

## Deployment

### Backend on Render

1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint** and select the repository (or create a Web
   Service with build command `npm install` and start command `npm start`).
3. Set the environment variables:
   - `MONGO_DB_URI` — MongoDB Atlas connection string (allow Render's IPs in Atlas).
   - `CLIENT_ORIGIN` — the deployed Vercel URL, e.g. `https://internship-portal.vercel.app`.
   - `NODE_ENV=production`.
4. Deploy. Verify `https://<backend>.onrender.com/api/health`.
5. The `render.yaml` blueprint and `Procfile` are included; Railway/Heroku work with the
   same start command.

### Frontend on Vercel

1. Import the repository in Vercel.
2. Set **Root Directory** to `client`.
3. Framework preset: **Vite**; build command `npm run build`; output directory `dist`.
4. Add the environment variable:
   - `VITE_API_URL=https://<backend>.onrender.com` (origin only, no `/api` suffix).
5. Deploy. `client/vercel.json` rewrites unknown paths to `index.html`, so direct visits to
   `/internships/:id` and `/applications` work.
6. Copy the final frontend URL into the backend's `CLIENT_ORIGIN` variable and redeploy the
   backend if it was set to a different value.

### Single-service option

The Express server serves `client/dist` when it exists. Run `npm run build` before
`npm start` to host the API and frontend together on one Node.js service (Dockerfile
included).

## Git workflow

```bash
git checkout main
git checkout -b rollno_v1
# ... make changes ...
git add .
git commit -m "feat: build student internship portal"
git checkout main
git merge --no-ff rollno_v1
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

## Notes

- The `/applications` page is intentionally public for this demo. A production portal should
  protect it with student/placement-cell authentication.
- Never commit `.env`; it is excluded by `.gitignore`. Only `env-example` and
  `client/.env.example` are tracked.
