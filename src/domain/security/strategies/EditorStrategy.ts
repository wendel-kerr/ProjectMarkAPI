import { IAccessStrategy, Action, Entity } from '../IAccessStrategy';
export class EditorStrategy implements IAccessStrategy {
  can(action: Action, entity: Entity): boolean {
    if (entity === 'user') return action === 'read';
    if (entity === 'topic' || entity === 'resource') return ['read','create','update','delete'].includes(action);
    return false;
  }
}
