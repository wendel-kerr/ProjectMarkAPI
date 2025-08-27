import request from 'supertest';
import { app } from '../../app';

let viewerToken: string;

beforeAll(async () => {
  await request(app).post('/auth/seed-defaults').send({});
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'viewer@example.com', password: 'password' });
  viewerToken = res.body.token;
});

describe('RBAC enforcement (Phase 8)', () => {
  it('prevents viewer from creating topic', async () => {
    const res = await request(app)
      .post('/topics')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ name: 'ShouldFail', content: 'Nope', parentId: null });
    expect(res.status).toBe(403);
  });
});
