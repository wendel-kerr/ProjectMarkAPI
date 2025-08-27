/**
 * express.d.ts
 * Augment de tipos para incluir req.user no Express.
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// augment Express Request.user
// Importações de dependências e tipos
import 'express-serve-static-core';
// Importações de dependências e tipos
import { UserRole } from '../domain/users/Role';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
    };
  }
}