# Knowledge Base API — Desafio Backend

API em **Node.js + TypeScript + Express** com persistência **in-memory (LokiJS)**. Atende aos requisitos do desafio:

- Entidades: **Topic**, **Resource**, **User** (roles: **Admin**, **Editor**, **Viewer**)
- **Auth** via **JWT** e **RBAC** (padrão Strategy)
- **CRUD de Tópicos** com **versionamento** (padrão **Factory** para versões)
- **Árvore recursiva** de tópicos (Composite)
- **Menor caminho** entre dois tópicos (algoritmo BFS implementado “na mão”, sem libs de grafo)
- **Validação** e **tratamento de erros** (Zod)
- **OpenAPI/Swagger** publicado em `/docs` e `/openapi.json`
- Testes **de integração** e **unitários** cobrindo pontos críticos

---

## 📦 Stack & Requisitos

- Node.js 18+ (recomendado 18/20)
- npm 9+
- TypeScript 5
- Express 4
- LokiJS (persistência em memória)
- Zod (validação) + `@asteasolutions/zod-to-openapi` (OpenAPI)
- Jest + ts-jest + supertest (testes)

---

## 🚀 Como rodar localmente

```bash
npm install
npm run dev
# opcional:
# JWT_SECRET=segredo npm run dev
```
- A API sobe em: **http://localhost:3000**
- Persistência é **in-memory** (reset a cada start)

### Variáveis de ambiente (opcionais)
- `PORT` (padrão `3000`)
- `JWT_SECRET` (padrão `dev-secret` para ambiente local)

---

## 👤 Usuários de seed (senha `password`)

A app semeia usuários automaticamente ao iniciar. Também é possível forçar:

```bash
curl -X POST http://localhost:3000/auth/seed-defaults -H 'Content-Type: application/json' -d '{}'
```

- `admin@example.com` · **Admin**
- `editor@example.com` · **Editor**
- `viewer@example.com` · **Viewer**

---

## 🔐 Autenticação & RBAC

- **Login:** `POST /auth/login` → `{ token, user }`
  - body: `{ "email": "admin@example.com", "password": "password" }`
- **Bearer Token:** envie `Authorization: Bearer <token>` nas rotas protegidas
- **Permissões** (Strategy):
  - **Admin:** total
  - **Editor:** read/write em `topic` e `resource`; read em `user`
  - **Viewer:** somente read

---

## 📚 Endpoints principais

### Health
- `GET /health` → `{ ok: true }`

### Swagger / OpenAPI
- **UI:** `GET /docs`
- **Documento:** `GET /openapi.json`

### Auth
- `POST /auth/seed-defaults` – cria usuários padrão (idempotente)
- `POST /auth/login` – retorna `{ token, user }`
- `GET /auth/me` – retorna usuário atual (Bearer)

### Topics (protegido)
- `POST /topics` *(Admin/Editor)* — cria **root** (`{ parentId: null }`) ou **filho** (`{ parentId: "<uuid>" }`)
- `GET /topics?parentId=<uuid|null>` *(todas as roles)*
- `GET /topics/:id` *(todas as roles)*
- `PATCH /topics/:id` *(Admin/Editor)* — cria **nova versão** (versionamento)
- `DELETE /topics/:id` *(Admin/Editor)* — **soft delete**
- `GET /topics/:id/versions` *(todas as roles)*
- `GET /topics/:id/versions/:version` *(todas as roles)*
- `GET /topics/:id/tree?version=latest|N&includeResources=true|false` *(todas as roles)* — árvore recursiva (Composite)

### Shortest Path (protegido)
- `GET /topics/shortest-path?from=<uuid>&to=<uuid>` *(todas as roles)*
  - Retorna `{ path: [ { id, name, version } ] }`
  - `404` se algum tópico não existe
  - `422` se **não há caminho** entre os nós (árvores desconectadas)

### Resources (protegido)
- `POST /resources` *(Admin/Editor)*
- `GET /resources?topicId=<uuid>` *(todas as roles)*
- `GET /resources/:id` *(todas as roles)*
- `PATCH /resources/:id` *(Admin/Editor)*
- `DELETE /resources/:id` *(Admin/Editor)*

---

## 🧪 Testes

### Rodar tudo
```bash
npm test
```

### Somente integração
```bash
npx jest --testPathPattern="\\.int\\.test\\.ts$"
```

### Somente unitários
```bash
npx jest --testPathPattern="src/tests/unit"
```

#### Cobertura de testes
- **Integração:** Auth/RBAC, Topics CRUD/Tree/Versioning, Resources, Shortest Path  
- **Unidade:**  
  - `TopicVersionFactory`: mantém `createdAt`, atualiza `updatedAt`, incrementa `version`  
  - `PermissionStrategy`: matriz de permissões (roles × ações × recursos)  
  - `TopicGraphService`: BFS com repo mock (mesmo nó, caminho, sem caminho)  
  - `AuthService`: login ok/erro + normalização de e-mail  
  - `Schemas (Zod)`: `createTopic`, `updateTopic`, `createResource`, `login`  
  - `TopicTreeService`: árvore com/sem resources via mocks

---

## 🧩 Padrões de projeto aplicados

- **Strategy**: RBAC (`PermissionStrategy`)
- **Composite**: construção da **árvore** (`TopicTreeService`)
- **Factory**: `TopicVersionFactory` (criação de versões inicial e subsequentes)
- **Layers**: rotas → services → repositórios → mapeadores → DB (Loki)
- **Validação**: Zod em DTOs de entrada; pipeline de normalização de e-mail:
  - `z.string().trim().transform(v => v.toLowerCase()).pipe(z.string().email())`

---

## 🗂️ Estrutura de pastas (resumo)

```
src/
  app.ts, server.ts
  routes/            # /topics, /resources, /auth, /docs
  services/          # Services.ts, TopicGraphService.ts
  middleware/        # auth (JWT + RBAC)
  domain/
    common/          # tipos base
    users/           # User, Role
    resources/       # Resource
    versioning/      # IVersion, VersionedEntity, TopicVersionFactory
    security/        # PermissionStrategy
  infra/
    db/              # Loki + tipos de registro
    mappers/         # DTO mappers
    repositories/    # TopicRepository, ResourceRepository, UserRepository
  schemas/           # openapi.ts
  types/             # augment de tipos Express
  tests/
    integration/     # *.int.test.ts
    unit/            # *.unit.test.ts
```

---

## ❗ Códigos de erro & validação

- **400** `VALIDATION_ERROR` (Zod)  
- **401** `UNAUTHORIZED` (token inválido/ausente)  
- **403** `FORBIDDEN` (RBAC)  
- **404** `Topic not found` / `Resource not found`  
- **409** `DUPLICATE_SIBLING_NAME` (irmão com mesmo nome)  
- **422** `NO_PATH` (shortest path inexistente)

---

## 🧭 Exemplos rápidos (cURL)

**Login**
```bash
curl -s -X POST http://localhost:3000/auth/login   -H 'Content-Type: application/json'   -d '{"email":"editor@example.com","password":"password"}' | jq -r .token
```

**Criar tópico root**
```bash
TOKEN=... # defina com o token acima
curl -s -X POST http://localhost:3000/topics   -H "Authorization: Bearer $TOKEN"   -H 'Content-Type: application/json'   -d '{"name":"Root","content":"Intro","parentId":null}'
```

**Árvore**
```bash
curl -s -H "Authorization: Bearer $TOKEN"   "http://localhost:3000/topics/<id_do_root>/tree?includeResources=true" | jq
```

**Menor caminho**
```bash
curl -s -H "Authorization: Bearer $TOKEN"   "http://localhost:3000/topics/shortest-path?from=<idA>&to=<idB>" | jq
```

---

## ✅ O que foi entregue (checklist do desafio)

- [x] Node + TS + Express + persistência simples  
- [x] Topic / Resource / User (roles)  
- [x] Auth (JWT) + RBAC (Strategy)  
- [x] CRUD Topic com **versionamento** (Factory)  
- [x] Árvore recursiva (Composite)  
- [x] Menor caminho (BFS sem libs)  
- [x] Validação/erros consistentes (Zod)  
- [x] OpenAPI/Swagger publicado  
- [x] Testes de integração e unitários essenciais  
- [x] README completo

---

## 📄 Licença

MIT (pode ajustar conforme sua preferência).
