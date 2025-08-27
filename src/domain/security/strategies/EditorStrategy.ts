import { IAccessStrategy, Action, Entity } from '../IAccessStrategy';

export class EditorStrategy implements IAccessStrategy {
  can(action: Action, entity: Entity): boolean {
    if (entity === 'user') {
      // Editors cannot manage users
      return action === 'read'; // optionally only read self in later phases
    }
    // Topics & Resources: full CRUD (except user management)
    if (entity === 'topic' || entity === 'resource') {
      return ['read', 'create', 'update', 'delete'].includes(action);
    }
    return false;
  }
}
