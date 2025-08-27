# Phase 4 — Endpoints de versionamento de Tópicos

Esta fase adiciona endpoints para **listar** e **recuperar** versões de um tópico, mantendo o modelo append-only:
- `GET /topics/:id/versions`
- `GET /topics/:id/versions/:version`

Os endpoints anteriores da Fase 3 (create/list/update/delete) permanecem.

## Quickstart
```bash
npm install
npm run dev
# ou
npm run build && npm start
```

## Notas
- As versões são mantidas em `topic_versions` e o registro do tópico aponta a versão atual via `currentVersion`.
- `PATCH /topics/:id` continua criando **vN+1** internamente.
