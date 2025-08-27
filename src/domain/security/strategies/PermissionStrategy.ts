import { UserRole } from '../../../domain/users/Role';

export interface PermissionStrategy {
  allows(role: UserRole, action: 'read'|'write', resource: 'topic'|'resource'|'user'): boolean;
}

export class DefaultRBACStrategy implements PermissionStrategy {
  allows(role: UserRole, action: 'read'|'write', resource: 'topic'|'resource'|'user'): boolean {
    if (role === UserRole.Admin) return true;
    if (role === UserRole.Editor) {
      if (resource === 'topic' || resource === 'resource') return true; // read & write
      if (resource === 'user') return action === 'read';
    }
    if (role === UserRole.Viewer) {
      return action === 'read'; // somente leitura
    }
    return false;
  }
}
