/**
 * auth.ts
 * Rotas de autenticação: seed e login; me.
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import { Router } from 'express';
// Importações de dependências e tipos
import { UserRepository } from '../infra/repositories/UserRepository';
// Importações de dependências e tipos
import { AuthService } from '../services/Services';
// Importações de dependências e tipos
import { authGuard } from '../middleware/auth';

const userRepo = new UserRepository();
const authService = new AuthService(userRepo);

// Declarações/exports principais
export const authRouter = Router();

  // Definição de rota HTTP
authRouter.post('/seed-defaults', async (_req, res, next) => {
  try {
    await authService.seedDefaultsIfEmpty();
    res.status(201).json({ ok: true });
  } catch (err) { next(err); }
});

  // Definição de rota HTTP
authRouter.post('/login', async (req, res, next) => {
  try {
    await authService.seedDefaultsIfEmpty();
    const out = await authService.login(req.body);
    res.json(out);
  } catch (err: any) {
    if (err?.message === 'INVALID_CREDENTIALS') return res.status(401).json({ code: 'INVALID_CREDENTIALS' });
    next(err);
  }
});

  // Definição de rota HTTP
authRouter.get('/me', authGuard, async (req, res) => {
  res.json({ user: req.user });
});