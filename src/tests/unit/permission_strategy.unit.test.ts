import { DefaultRBACStrategy } from '../../domain/security/strategies/PermissionStrategy';
import { UserRole } from '../../domain/users/Role';

/**
 * Testa a matriz RBAC (Admin/Editor/Viewer × read/write × topic/resource/user).
 * Este é um teste puro de unidade, sem HTTP.
 */
describe('PermissionStrategy (RBAC) - unit', () => {
  const strat = new DefaultRBACStrategy();

  const cases: Array<[UserRole,'read'|'write','topic'|'resource'|'user', boolean]> = [
    // Admin: tudo liberado
    [UserRole.Admin,'read','topic',true],[UserRole.Admin,'write','topic',true],
    [UserRole.Admin,'read','resource',true],[UserRole.Admin,'write','resource',true],
    [UserRole.Admin,'read','user',true],[UserRole.Admin,'write','user',true],

    // Editor: pode ler e escrever topic/resource; user: apenas read
    [UserRole.Editor,'read','topic',true],[UserRole.Editor,'write','topic',true],
    [UserRole.Editor,'read','resource',true],[UserRole.Editor,'write','resource',true],
    [UserRole.Editor,'read','user',true],[UserRole.Editor,'write','user',false],

    // Viewer: apenas leitura em tudo
    [UserRole.Viewer,'read','topic',true],[UserRole.Viewer,'write','topic',false],
    [UserRole.Viewer,'read','resource',true],[UserRole.Viewer,'write','resource',false],
    [UserRole.Viewer,'read','user',true],[UserRole.Viewer,'write','user',false],
  ];

  it.each(cases)('%s %s %s -> %s', (role, action, res, expected) => {
    expect(strat.allows(role, action, res)).toBe(expected);
  });
});