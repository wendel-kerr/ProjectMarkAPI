# Knowledge Base API

## How to run

### Prerequisites
- Node.js 18+ and npm  
  *(Optional)* Docker 24+

### Environment
Set the JWT secret:
```bash
export JWT_SECRET=your_secret
```
On Windows (PowerShell):
```powershell
$env:JWT_SECRET="your_secret"
```

### Run (local)
```bash
npm install
npm run dev        # start in dev mode
# or:
npm run build
npm start          # runs compiled dist/
```

### Run (Docker)
```bash
docker build -t knowledge-base-api .
docker run -p 3000:3000 -e JWT_SECRET=your_secret knowledge-base-api
```

**Base URL:** `http://localhost:3000`

---

## Database setup

No external database is required. The API uses an **embedded LokiJS** store, created automatically at startup (no migrations needed).  

For development, seed default users with:
```bash
POST /auth/seed-defaults
Body: {}
```

Example:
```bash
curl -X POST http://localhost:3000/auth/seed-defaults   -H 'Content-Type: application/json'   -d '{}'
```

---

## Authentication

### Seed default users
All with password `password`:
- `admin@example.com` (Admin)
- `editor@example.com` (Editor)
- `viewer@example.com` (Viewer)

> Emails include a valid TLD as required by validation.

### Login
```bash
curl -X POST http://localhost:3000/auth/login   -H 'Content-Type: application/json'   -d '{"email":"admin@example.com","password":"password"}'
```
Response:
```json
{ "token": "<JWT>" }
```

Use the token in protected routes:
```
Authorization: Bearer <JWT>
```

Example request with token:
```bash
TOKEN="<paste token here>"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/topics
```
