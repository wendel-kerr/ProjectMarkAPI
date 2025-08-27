import express from 'express';
import { topicsRouter } from './routes/topics';
import { resourcesRouter } from './routes/resources';
import { docsRouter } from './routes/docs';
import { authRouter } from './routes/auth';
import { UserRepository } from './infra/repositories/UserRepository';
import { AuthService } from './services/Services';

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
