import { AuthService, loginSchema } from '../../services/Services';
import { UserRepository } from '../../infra/repositories/UserRepository';
import bcrypt from 'bcryptjs';

/**
 * Testa o AuthService isolado com mock de UserRepository.
 */
describe('AuthService - unit', () => {
  const password = 'Secr3t!';
  const passwordHash = bcrypt.hashSync(password, 8);

  // mock simples do repo
  const user = {
    id: 'u1',
    name: 'Alice',
    email: 'user@example.com',
    role: 'Editor',
    passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const repoMock: Partial<UserRepository> = {
    findByEmail: async (email: string) => email === user.email ? (user as any) : null,
    count: async () => 1,
  };

  const svc = new AuthService(repoMock as UserRepository);

  it('normaliza e-mail e valida login ok', async () => {
    const input = { email: '  USER@EXAMPLE.COM  ', password };
    const parsed = loginSchema.parse(input);
    expect(parsed.email).toBe('user@example.com'); // normalizado

    const out = await svc.login(input);
    expect(out.user.email).toBe('user@example.com');
    expect(out.token).toBeTruthy();
  });

  it('lança erro para credenciais inválidas', async () => {
    await expect(svc.login({ email: 'user@example.com', password: 'wrong' })).rejects.toThrow('INVALID_CREDENTIALS');
  });
});