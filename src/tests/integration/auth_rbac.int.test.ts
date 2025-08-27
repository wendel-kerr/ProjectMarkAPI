import request from 'supertest';
import { app } from '../../app';

let adminToken: string;

beforeAll(async () => {
  await request(app).post('/auth/seed-defaults').send({});
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@example.com', password: 'password' });

  adminToken = res.body.token;
});

test('Admin can create a topic', async () => {
  const res = await request(app)
    .post('/topics')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'New Topic', content: 'Hello World', parentId: null });

  expect(res.status).toBe(201);
});
