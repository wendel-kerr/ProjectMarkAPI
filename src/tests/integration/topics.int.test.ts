import request from 'supertest';
import { app } from '../../app';

describe('Topics routes (Phase 2)', () => {
  let createdId: string;

  it('POST /topics creates a root topic', async () => {
    const res = await request(app).post('/topics').send({
      name: 'Architecture',
      content: 'Root content',
      parentId: null
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.version).toBe(1);
    createdId = res.body.id;
  });

  it('GET /topics/:id returns created topic', async () => {
    const res = await request(app).get(`/topics/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Architecture');
  });

  it('POST /topics creates a child topic', async () => {
    const root = await request(app).post('/topics').send({ name: 'Root2', content: 'R2', parentId: null });
    const parentId = root.body.id;
    const child = await request(app).post('/topics').send({ name: 'Child2', content: 'C2', parentId });
    expect(child.status).toBe(201);
    expect(child.body.parentTopicId).toBe(parentId);
  });
});
