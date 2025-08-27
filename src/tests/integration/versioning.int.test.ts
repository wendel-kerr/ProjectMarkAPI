import request from 'supertest';
import app from '../../app';

let token: string;

beforeAll(async () => {
  await request(app).post('/auth/seed-defaults').send({});
  const res = await request(app).post('/auth/login').send({ email: 'editor@example.com', password: 'password' });
  token = res.body.token;
});

describe('Topics versioning (Phase 4)', () => {
  it('lists and retrieves versions after updates', async () => {
    const root = await request(app).post('/topics').set('Authorization', `Bearer ${token}`)
      .send({ name: 'RootV', content: 'v1', parentId: null });
    expect(root.status).toBe(201);
    const rootId = root.body.id;

    await request(app).patch(`/topics/${rootId}`).set('Authorization', `Bearer ${token}`).send({ name: 'RootV2', content: 'v2' });
    await request(app).patch(`/topics/${rootId}`).set('Authorization', `Bearer ${token}`).send({ name: 'RootV3', content: 'v3' });

    const versions = await request(app).get(`/topics/${rootId}/versions`).set('Authorization', `Bearer ${token}`);
    expect(versions.status).toBe(200);
    expect(versions.body.length).toBeGreaterThanOrEqual(2);
  });
});