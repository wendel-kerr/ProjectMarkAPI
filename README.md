# Knowledge Base API — Auth (JWT) + RBAC + Shortest Path

## Como rodar
```bash
npm install
npm run dev
# ou: npm run build && npm start
# Seeds automáticos: admin@example.com / editor@example.com / viewer@example.com (senha: password)
```

## Endpoints
- `POST /auth/login` → `{ token, user }`
- `GET /auth/me` (Bearer)
- `GET /docs` | `GET /openapi.json`

- `POST /topics` (Editor/Admin)
- `GET /topics?parentId=<uuid|null>`
- `GET /topics/{id}`
- `PATCH /topics/{id}` (nova versão)
- `DELETE /topics/{id}` (soft)
- `GET /topics/{id}/versions`
- `GET /topics/{id}/versions/{version}`
- `GET /topics/{id}/tree?version=latest|N&includeResources=true|false`

- `POST /resources`
- `GET /resources?topicId=<uuid>`
- `GET /resources/{id}`
- `PATCH /resources/{id}`
- `DELETE /resources/{id}`

- **Novo**: `GET /topics/shortest-path?from=<uuid>&to=<uuid>`
