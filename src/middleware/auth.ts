/**
 * auth.ts
 * Auth guard do JWT e verificação de permissões (RBAC).
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import { Request, Response, NextFunction } from 'express';
// Importações de dependências e tipos
import jwt from 'jsonwebtoken';
// Importações de dependências e tipos
import { DefaultRBACStrategy, PermissionStrategy } from '../domain/security/strategies/PermissionStrategy';
// Importações de dependências e tipos
import { UserRole } from '../domain/users/Role';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Declarações/exports principais
export type AuthUser = { id: string; name: string; email: string; role: UserRole };

declare global {
  namespace Express {
    interface Request { user?: AuthUser; }
  }
}

// Declarações/exports principais
export function signJwt(user: AuthUser): string {
  // Retorna o resultado da operação
  return jwt.sign({ sub: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
}

// Declarações/exports principais
export function authGuard(req: Request, res: Response, next: NextFunction) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
  // Retorna o resultado da operação
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' });
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = { id: payload.sub, name: payload.name, email: payload.email, role: payload.role };
    next();
  } catch (_err) {
  // Retorna o resultado da operação
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  }
}

const strategy: PermissionStrategy = new DefaultRBACStrategy();
// Declarações/exports principais
export function requirePermission(action: 'read'|'write', resource: 'topic'|'resource'|'user') {
  // Retorna o resultado da operação
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ code: 'UNAUTHORIZED' });
    const ok = strategy.allows(req.user.role, action, resource);
    if (!ok) return res.status(403).json({ code: 'FORBIDDEN', message: 'Insufficient permissions' });
    next();
  };
}