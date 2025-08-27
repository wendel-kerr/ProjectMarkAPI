import { IAccessStrategy, Action, Entity } from '../IAccessStrategy';
export class AdminStrategy implements IAccessStrategy { can(_action: Action, _entity: Entity): boolean { return true; } }
