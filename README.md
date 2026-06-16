# RealTimeProject

Full-stack real-time application with a Node/Express backend and a frontend client.

## Purpose

Backend exposes user authentication and product/category endpoints that the frontend consumes.

## Prerequisites

- Node.js v14+ installed
- A running database (see `Backend/src/config/db.js` for the project's DB config)

## Setup

1. Clone the repository

```bash
git clone <repo-url>
cd RealTimeProject
```

2. Install backend dependencies

```bash
cd Backend
npm install
```

3. (Optional) Install frontend dependencies

```bash
cd ../Frontend
npm install
```

## Environment

Create a `.env` file in `Backend/` with the following variables:

- `JWT_SECRET` - secret used to sign JWTs
- `BCRYPT_ROUNDS` - bcrypt cost factor (e.g. `10`)
- `PORT` - backend port (default: `2000`)
- `DB_URI` - your database connection string

## Run

Start the backend:

```bash
cd Backend
node app.js
```

If `package.json` contains a start script you can run:

```bash
npm start
```

Start the frontend (if present):

```bash
cd Frontend
npm start
```

## API (Backend)

- `POST /Users/login` — Login with JSON body `{ "email": "...", "password": "..." }`. Returns `{ "token": "..." }`.
- `POST /Users/register` — (If implemented) Register a new user with `{ "email", "password", ... }`.
- `GET /Users/categories` — Public list of categories.
- `GET /Users/Homeproducts` — Public list of products for home page.
- `GET /Users/:id/dashboard` — Protected route. Send header `Authorization: Bearer <token>`.

Authentication notes:

- Passwords are hashed using `bcrypt` (`bcrypt.hash`) before storage.
- To access protected endpoints include the `Authorization` header with the JWT returned from login.

## Security Recommendations

- Keep `JWT_SECRET` out of source control and rotate periodically.
- Use an appropriate `BCRYPT_ROUNDS` (10–12 typical) and set via `BCRYPT_ROUNDS`.
- Validate and sanitize incoming request data.
- Use HTTPS in production and consider additional protections (rate limiting, 2FA).

## Development

- Server entry: `Backend/app.js`
- Auth middleware: `Backend/src/Middleware/auth.js`
- User service: `Backend/src/services/Userservice.js`



