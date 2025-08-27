import { UserRole } from '../users/Role';
import { IAccessStrategy, IRoleStrategyFactory } from './IAccessStrategy';
import { AdminStrategy } from './strategies/AdminStrategy';
import { EditorStrategy } from './strategies/EditorStrategy';
import { ViewerStrategy } from './strategies/ViewerStrategy';

export class RoleStrategyFactory implements IRoleStrategyFactory {
  forRole(role: UserRole): IAccessStrategy {
    switch (role) {
      case UserRole.Admin: return new AdminStrategy();
      case UserRole.Editor: return new EditorStrategy();
      case UserRole.Viewer: return new ViewerStrategy();
      default: return new ViewerStrategy();
    }
  }
}
