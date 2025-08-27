import { UserRole } from '../users/Role';
export type Entity = 'topic'|'resource'|'user'; export type Action = 'read'|'create'|'update'|'delete';
export interface IAccessStrategy { can(action: Action, entity: Entity, context?: unknown): boolean; }
export interface IRoleStrategyFactory { forRole(role: UserRole): IAccessStrategy; }
