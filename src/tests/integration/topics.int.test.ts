import request from 'supertest';
import app from '../../app';

let editorToken: string;

beforeAll(async () => {
  await request(app).post('/auth/seed-defaults').send({});
  const res = await request(app).post('/auth/login').send({ email: 'editor@example.com', password: 'password' });
  editorToken = res.body.token;
});

describe('Topics CRUD', () => {
  it('creates, reads, updates and deletes a topic', async () => {
    const create = await request(app).post('/topics').set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'Topic A', content: 'Text A', parentId: null });
    expect(create.status).toBe(201);
    const topicId = create.body.id;

    const read = await request(app).get(`/topics/${topicId}`).set('Authorization', `Bearer ${editorToken}`);
    expect(read.status).toBe(200);
    expect(read.body.name).toBe('Topic A');

    const update = await request(app).patch(`/topics/${topicId}`).set('Authorization', `Bearer ${editorToken}`)
      .send({ content: 'Updated Text A' });
    expect(update.status).toBe(200);
    expect(update.body.content).toBe('Updated Text A');

    const del = await request(app).delete(`/topics/${topicId}`).set('Authorization', `Bearer ${editorToken}`);
    expect(del.status).toBe(204);
  });
});