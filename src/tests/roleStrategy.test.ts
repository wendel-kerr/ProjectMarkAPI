import { RoleStrategyFactory } from '../domain/security/RoleStrategyFactory';
import { UserRole } from '../domain/users/Role';

describe('Role Strategy (RBAC)', () => {
  const factory = new RoleStrategyFactory();

  test('Admin can do everything', () => {
    const s = factory.forRole(UserRole.Admin);
    expect(s.can('create','topic')).toBe(true);
    expect(s.can('delete','user')).toBe(true);
  });

  test('Editor can CRUD topics/resources but not manage users', () => {
    const s = factory.forRole(UserRole.Editor);
    expect(s.can('create','topic')).toBe(true);
    expect(s.can('update','resource')).toBe(true);
    expect(s.can('delete','user')).toBe(false);
  });

  test('Viewer can only read topics/resources', () => {
    const s = factory.forRole(UserRole.Viewer);
    expect(s.can('read','topic')).toBe(true);
    expect(s.can('create','topic')).toBe(false);
    expect(s.can('read','user')).toBe(false);
  });
});
