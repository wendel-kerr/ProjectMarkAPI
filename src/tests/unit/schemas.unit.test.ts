import { z } from 'zod';
import { createTopicSchema, updateTopicSchema, createResourceSchema, loginSchema } from '../../services/Services';

/**
 * Validações Zod dos DTOs (sem HTTP).
 */
describe('Schemas (Zod) - unit', () => {
  it('createTopicSchema válidos/ inválidos', () => {
    expect(createTopicSchema.parse({ name: 'N', content: 'C', parentId: null }).name).toBe('N');
    expect(() => createTopicSchema.parse({ name: '', content: 'C' })).toThrow(z.ZodError);
  });

  it('updateTopicSchema exige ao menos um campo', () => {
    expect(() => updateTopicSchema.parse({})).toThrow();
    expect(updateTopicSchema.parse({ name: 'X' }).name).toBe('X');
  });

  it('createResourceSchema valida url e topicId', () => {
    const ok = createResourceSchema.parse({ topicId: '11111111-1111-1111-1111-111111111111', url: 'https://ex.com', type: 'link' });
    expect(ok.type).toBe('link');
    expect(() => createResourceSchema.parse({ topicId: 'bad', url: 'x', type: '' })).toThrow(z.ZodError);
  });

  it('loginSchema normaliza e-mail', () => {
    const p = loginSchema.parse({ email: ' TEST@X.COM ', password: '123' });
    expect(p.email).toBe('test@x.com');
  });
});