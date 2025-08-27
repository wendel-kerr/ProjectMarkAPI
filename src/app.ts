/**
 * app.ts
 * Inicializa o Express, aplica middlewares, registra rotas e seed de usuários.
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import express from 'express';
// Importações de dependências e tipos
import { topicsRouter } from './routes/topics';
// Importações de dependências e tipos
import { resourcesRouter } from './routes/resources';
// Importações de dependências e tipos
import { docsRouter } from './routes/docs';
// Importações de dependências e tipos
import { authRouter } from './routes/auth';
// Importações de dependências e tipos
import { UserRepository } from './infra/repositories/UserRepository';
// Importações de dependências e tipos
import { AuthService } from './services/Services';

// Declarações/exports principais
export const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

// seed default users at startup (idempotent)
(async () => {
  const repo = new UserRepository();
  const svc = new AuthService(repo);
  await svc.seedDefaultsIfEmpty();
})();

app.use('/auth', authRouter);
app.use('/topics', topicsRouter);
app.use('/resources', resourcesRouter);
app.use('/', docsRouter);

// error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Something went wrong' });
});

export default app;