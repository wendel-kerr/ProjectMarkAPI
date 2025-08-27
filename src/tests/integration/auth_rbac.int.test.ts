import request from 'supertest';
import app from '../../app';

describe('Auth + RBAC', () => {
  let adminToken = '';
  let viewerToken = '';

  beforeAll(async () => {
    await request(app).post('/auth/seed-defaults').send({});
    const admin = await request(app).post('/auth/login').send({ email: 'admin@example.com', password: 'password' });
    expect(admin.status).toBe(200);
    adminToken = admin.body.token;

    const viewer = await request(app).post('/auth/login').send({ email: 'viewer@example.com', password: 'password' });
    expect(viewer.status).toBe(200);
    viewerToken = viewer.body.token;
  });

  it('viewer cannot create topics (403), but can read', async () => {
    const create = await request(app)
      .post('/topics')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ name: 'X', content: 'Y', parentId: null });
    expect(create.status).toBe(403);

    const list = await request(app)
      .get('/topics')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(list.status).toBe(200);
  });

  it('admin can create and delete', async () => {
    const create = await request(app)
      .post('/topics')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'RootAuth', content: 'R', parentId: null });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const del = await request(app)
      .delete(`/topics/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(del.status).toBe(204);
  });
});