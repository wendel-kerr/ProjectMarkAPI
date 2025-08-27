import { IAccessStrategy, Action, Entity } from '../IAccessStrategy';

export class ViewerStrategy implements IAccessStrategy {
  can(action: Action, entity: Entity): boolean {
    // Viewers can only read topics/resources
    if ((entity === 'topic' || entity === 'resource') && action === 'read') return true;
    // No user management
    return false;
  }
}
