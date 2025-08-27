/**
 * PermissionStrategy.ts
 * Strategy de permissões por role.
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import { UserRole } from '../../users/Role';

// Declarações/exports principais
export interface PermissionStrategy {
  allows(role: UserRole, action: 'read'|'write', resource: 'topic'|'resource'|'user'): boolean;
}

// Declarações/exports principais
export class DefaultRBACStrategy implements PermissionStrategy {
  allows(role: UserRole, action: 'read'|'write', resource: 'topic'|'resource'|'user'): boolean {
    if (role === UserRole.Admin) return true;
    if (role === UserRole.Editor) {
      if (resource === 'topic' || resource === 'resource') return true;
      if (resource === 'user') return action === 'read';
    }
    if (role === UserRole.Viewer) {
  // Retorna o resultado da operação
      return action === 'read';
    }
  // Retorna o resultado da operação
    return false;
  }
}