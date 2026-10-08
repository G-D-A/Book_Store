# Book_Store

A small full-stack book library application with JWT authentication and role-based access control.

## Stack

- Frontend: React, TypeScript, Vite, React Router
- Backend: Node.js, Express, TypeScript, Mongoose
- Database: MongoDB Atlas
- Authentication: bcrypt password hashes and JWT

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- A MongoDB Atlas cluster

## Installation

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Configure `server/.env` before starting the application. Keep `.env` private: it is ignored by Git and must never be committed.

## Environment variables

### Server (`server/.env`)

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend port. Defaults to `4000`. |
| `CLIENT_ORIGIN` | Allowed frontend origin, normally `http://localhost:5173`. |
| `MONGODB_URI` | MongoDB Atlas connection string. |
| `JWT_SECRET` | Long random secret used to sign access tokens. |
| `ADMIN_NAME` | Initial administrator name, used only by the seed script. |
| `ADMIN_EMAIL` | Initial administrator email, used only by the seed script. |
| `ADMIN_PASSWORD` | Initial administrator password, used only by the seed script. |

Generate a JWT secret locally:

```bash
openssl rand -base64 48
```

For Atlas, create a database user and add your current IP address under **Network Access**. Copy its Node.js driver connection string into `MONGODB_URI`. URL-encode special characters in the database password.

### Client (`client/.env`)

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend API URL. Defaults to `http://localhost:4000`. |

## Run the application

Run client and server together:

```bash
npm run dev
```

- Client: `http://localhost:5173`
- Server: `http://localhost:4000`
- Health check: `GET http://localhost:4000/health`

Production build:

```bash
npm run build
```

Backend type check and tests:

```bash
npm run typecheck --workspace=server
npm run test --workspace=server
```

## Create the first administrator

Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `server/.env`, then run:

```bash
npm run seed:admin --workspace=server
```

The script is safe to rerun: it does not create a second administrator with the same email.

## Project structure

```text
client/
  src/api/           API client
  src/auth/          Auth state and persistence
  src/components/    Navigation and protected-route components
  src/pages/         Login, signup, book and user pages
server/
  src/config/        Environment and MongoDB connection
  src/controllers/   Route handlers
  src/errors/        Application error type
  src/middlewares/   Auth, role and error middleware
  src/models/        User and Book Mongoose schemas
  src/routes/        API route definitions
  src/scripts/       Admin seed script
  src/utils/         Password, response and async helpers
```

## Authentication and roles

`POST /signup` always creates a `user`, even if the request body includes another role. Passwords are hashed with bcrypt before storage. Login returns a JWT that contains the user id and role.

Send the JWT on protected requests:

```text
Authorization: Bearer <token>
```

| Capability | user | admin |
| --- | :---: | :---: |
| Read books | Yes | Yes |
| Create, edit, delete books | No | Yes |
| View and manage users | No | Yes |

Frontend route checks improve UX; the backend independently enforces every permission.

## API

### Public routes

| Method | Route | Body |
| --- | --- | --- |
| `POST` | `/signup` | `name`, `email`, `password` |
| `POST` | `/login` | `email`, `password` |

### Book routes

| Method | Route | Access |
| --- | --- | --- |
| `GET` | `/books` | user, admin |
| `GET` | `/books/:id` | user, admin |
| `POST` | `/books` | admin |
| `PATCH` | `/books/:id` | admin |
| `DELETE` | `/books/:id` | admin |

Book body: `name`, `author`, `pageCount`. `pageCount` must be a positive whole number.

### User routes

| Method | Route | Access |
| --- | --- | --- |
| `GET` | `/users` | admin |
| `GET` | `/users/:id` | admin |
| `POST` | `/users` | admin |
| `PATCH` | `/users/:id` | admin |
| `DELETE` | `/users/:id` | admin |

For safety, an admin cannot delete their own account, and the final administrator cannot be removed or demoted.

## Error responses

The API returns JSON in the form:

```json
{ "message": "Human-readable description" }
```

| Code | Meaning |
| --- | --- |
| `401` | Missing, invalid, or expired JWT |
| `403` | Authenticated user does not have required permissions |
| `404` | Route or requested resource does not exist |
| `409` | Duplicate email or protected admin action |
| `422` | Invalid request data |
| `500` | Unexpected server error |
