import request from 'supertest';
import app from '../../app';

let token: string;

beforeAll(async () => {
  await request(app).post('/auth/seed-defaults').send({});
  const res = await request(app).post('/auth/login').send({ email: 'editor@example.com', password: 'password' });
  token = res.body.token;
});

describe('Topics tree (Phase 3)', () => {
  it('builds correct tree structure', async () => {
    const root = await request(app).post('/topics').set('Authorization', `Bearer ${token}`)
      .send({ name: 'RootT', content: 'T', parentId: null });
    expect(root.status).toBe(201);
    const rootId = root.body.id;

    const child = await request(app).post('/topics').set('Authorization', `Bearer ${token}`)
      .send({ name: 'ChildT', content: 'CT', parentId: rootId });
    expect(child.status).toBe(201);

    const tree = await request(app).get(`/topics/${rootId}/tree`).set('Authorization', `Bearer ${token}`);
    expect(tree.status).toBe(200);
    expect(tree.body.children.length).toBeGreaterThan(0);
  });
});