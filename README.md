# PrimeTrade Backend Developer Intern Assignment

This project implements a scalable REST API with authentication, role-based access control, task CRUD, API documentation, and a simple frontend UI to interact with APIs.

## Tech Stack

- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose)
- Auth: JWT + bcrypt password hashing
- Validation/Security: express-validator, helmet, hpp, mongo-sanitize, rate limiting
- API Docs: Swagger UI + Postman collection
- Frontend: Vanilla JS + HTML/CSS (served by backend)

## Features Implemented

- User registration and login APIs
- Password hashing with bcrypt
- JWT-protected routes
- Role-based access (`user` and `admin`)
- CRUD APIs for `tasks` entity
- API versioning (`/api/v1`)
- Input validation and sanitization
- Centralized error handling
- Swagger docs at `/api-docs`
- Postman collection in `docs/PrimeTrade.postman_collection.json`
- Basic frontend UI with separate auth pages:
  - `/create-account`
  - `/sign-in`
  - `/` for protected dashboard + task CRUD

## Project Structure

```text
primetrade_backend/
  docs/
    PrimeTrade.postman_collection.json
  public/
    create-account.html
    index.html
    sign-in.html
    styles.css
    app.js
  src/
    config/
    controllers/
    docs/
    middlewares/
    models/
    routes/v1/
    scripts/
    utils/
    validators/
    app.js
    server.js
  .env.example
  docker-compose.yml
  Dockerfile
  package.json
```

## Setup & Run

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Update `.env` values (especially `JWT_SECRET` and `MONGO_URI`).

4. Start MongoDB and app:

- Option A (local MongoDB installed):

```bash
npm run dev
```

- Option B (Docker):

```bash
docker compose up --build
```

5. Open:

- API base: `http://localhost:4000/api/v1`
- Swagger: `http://localhost:4000/api-docs`
- Frontend UI: `http://localhost:4000/`
- Create Account page: `http://localhost:4000/create-account`
- Sign In page: `http://localhost:4000/sign-in`

## Environment Variables

See `.env.example`:

- `NODE_ENV`
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_PASSWORD`

## API Endpoints

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` (JWT required)
- `GET /api/v1/auth/admin` (Admin only)

### Tasks

- `POST /api/v1/tasks` (JWT required)
- `GET /api/v1/tasks` (JWT required; users see only own tasks, admins can see all)
- `GET /api/v1/tasks/:taskId` (JWT required)
- `PATCH /api/v1/tasks/:taskId` (JWT required; user can edit only own task)
- `DELETE /api/v1/tasks/:taskId` (JWT required)

### Admin

- `GET /api/v1/admin/users` (Admin only)
- `GET /api/v1/admin/users/:userId/tasks` (Admin only)

## RBAC Rules

- `user`:
  - Can create/read/update/delete only their own tasks
- `admin`:
  - Can access all tasks
  - Can access admin-only route `/api/v1/auth/admin`

Admin account can be auto-created from `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD`.

## Postman Usage

1. Import `docs/PrimeTrade.postman_collection.json`.
2. Set collection variable `baseUrl` if needed.
3. Run `Auth > Login` (token is stored automatically in collection variable `token`).
4. Run task requests.

## Security Practices

- Password hashing with bcrypt (cost factor 12)
- JWT validation middleware
- Role-based authorization middleware
- Input validation with express-validator
- Input sanitization via trimming/escaping and mongo query sanitization
- Security headers via helmet
- Rate limiting on `/api/*`
- Parameter pollution prevention with hpp

## Logs

- Request logs are written to `logs/access.log`
- Crash/runtime logs are written to `logs/error.log`
- Console logging remains enabled for local debugging

## Scalability Note

- Modular structure (`controllers`, `services-style utils`, `middlewares`, `validators`, `routes`) supports adding modules cleanly.
- API versioning with `/api/v1` allows backward-compatible expansion (`/api/v2` later).
- Database indexes on user email and task ownership improve query performance.
- Horizontal scaling is supported by stateless JWT auth and external MongoDB.
- Can be extended with Redis caching, async job queues, centralized logging, and microservice split by domain.
