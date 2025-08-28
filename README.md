# Knowledge Base API

A simple REST API for organizing knowledge into hierarchical topics, with JWT authentication and role‑based access control (RBAC).

---

## Getting Started

### Requirements
- Node.js 18+ and npm
- (Optional) Docker 24+

### Environment
The app loads environment variables via `dotenv` and validates them with Zod (`src/config/env.ts`).

Create a local `.env` from the example:
```bash
cp .env.example .env
# Edit .env and set JWT_SECRET (min. 16 characters)
```

Used variables:
- `PORT` (default: `3000`)
- `JWT_SECRET` (**required**, min. 16 characters)

---

## Run Locally

### Development
```bash
npm install
npm run dev
```

### Build & Run
```bash
npm run build
npm start
```

**Base URL:** `http://localhost:3000`

---

## Docker

```bash
docker build -t knowledge-base-api .
docker run -p 3000:3000 --env-file .env knowledge-base-api
```

---

## Data Store

No external database is required. The API uses an in‑memory **LokiJS** store that is initialized automatically (no migrations).

To seed default users/roles for local usage:
```
POST /auth/seed-defaults
Body: {}
```

Example (cURL):
```bash
curl -X POST http://localhost:3000/auth/seed-defaults   -H 'Content-Type: application/json'   -d '{}'
```

---

## Authentication

### Default users (seed)
All users are created with password `password`:
- `admin@example.com` (Admin)
- `editor@example.com` (Editor)
- `viewer@example.com` (Viewer)

> Note: emails are validated with TLD; use domains like `@example.com`.

### Login (JWT)
```
POST /auth/login
{ "email": "<email>", "password": "password" }
```

Example:
```bash
curl -X POST http://localhost:3000/auth/login   -H 'Content-Type: application/json'   -d '{"email":"admin@example.com","password":"password"}'
```

Response (excerpt):
```json
{ "token": "<JWT>" }
```

Send the token in protected requests:
```
Authorization: Bearer <JWT>
```

Example authenticated request:
```bash
TOKEN="<paste_token_here>"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/topics
```

---

## API Documentation

- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/openapi.json`

---

## Testing

### Run all tests
```bash
npm test
```

### Run only unit tests
```bash
npx jest --testPathPattern="src/tests/unit"
```

### Run only integration tests
```bash
npx jest --testPathPattern=".int.test.ts$"
```

### Coverage
To check test coverage:
```bash
npx jest --coverage
```

> **Note:**
> - You must set `JWT_SECRET` in your environment (or `.env`) to run tests.
> - All critical business logic and endpoints are covered by unit and integration tests.
> - Default users are seeded automatically for integration tests.

