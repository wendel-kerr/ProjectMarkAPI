import express from 'express';
import { topicsRouter } from './routes/topics';

export const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/topics', topicsRouter);

// basic error handler (last resort)
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Something went wrong' });
});
