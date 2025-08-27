# Phase 2 — In-memory persistence (LokiJS) + Repositories + Minimal Express

This phase wires the Phase 1 domain into a simple in-memory database (LokiJS), adds repositories and a tiny Express API so you can already create and fetch topics.

## Quickstart
```bash
npm install
npm run dev            # start dev server at http://localhost:3000
# or
npm run build && npm start
```

## Minimal API
- POST /topics
  ```json
  { "name": "Architecture", "content": "Root content", "parentId": null }
  ```
- GET /topics/:id

## Notes
- Persistence strategy: append-only versions in `topic_versions` and a `topics` collection that holds parent relation and the pointer to current version number.
- The domain model (Composite + Versioning + Factory + Strategy) is copied from Phase 1.
- In this phase we only expose minimal endpoints for smoke integration; full version endpoints arrive in Phase 4.
