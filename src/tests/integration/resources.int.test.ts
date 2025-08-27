import request from 'supertest';
import app from '../../app';

let editorToken: string;

beforeAll(async () => {
  await request(app).post('/auth/seed-defaults').send({});
  const res = await request(app).post('/auth/login').send({ email: 'editor@example.com', password: 'password' });
  editorToken = res.body.token;
});

describe('Resources CRUD (Phase 6)', () => {
  it('creates, reads, lists by topic, updates and deletes resources; tree includes resources', async () => {
    const root = await request(app).post('/topics').set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'RootR', content: 'R', parentId: null });
    expect(root.status).toBe(201);
    const rootId = root.body.id;

    const child = await request(app).post('/topics').set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'ChildR', content: 'C', parentId: rootId });
    expect(child.status).toBe(201);
    const childId = child.body.id;

    const r1 = await request(app).post('/resources').set('Authorization', `Bearer ${editorToken}`)
      .send({ topicId: rootId, url: 'https://example.com/a', type: 'link', description: 'Root link' });
    expect(r1.status).toBe(201);

    const r2 = await request(app).post('/resources').set('Authorization', `Bearer ${editorToken}`)
      .send({ topicId: childId, url: 'https://example.com/b', type: 'pdf', description: 'Child pdf' });
    expect(r2.status).toBe(201);

    const r1get = await request(app).get(`/resources/${r1.body.id}`).set('Authorization', `Bearer ${editorToken}`);
    expect(r1get.status).toBe(200);
    expect(r1get.body.url).toBe('https://example.com/a');

    const listRoot = await request(app).get('/resources').set('Authorization', `Bearer ${editorToken}`).query({ topicId: rootId });
    expect(listRoot.status).toBe(200);
    expect(listRoot.body.length).toBe(1);

    const upd = await request(app).patch(`/resources/${r2.body.id}`).set('Authorization', `Bearer ${editorToken}`)
      .send({ description: 'Child pdf updated' });
    expect(upd.status).toBe(200);
    expect(upd.body.description).toBe('Child pdf updated');

    const tree = await request(app).get(`/topics/${rootId}/tree`).set('Authorization', `Bearer ${editorToken}`)
      .query({ includeResources: 'true' });
    expect(tree.status).toBe(200);
    const txt = JSON.stringify(tree.body);
    expect(txt).toContain('https://example.com/a');
    expect(txt).toContain('https://example.com/b');

    const del = await request(app).delete(`/resources/${r2.body.id}`).set('Authorization', `Bearer ${editorToken}`);
    expect(del.status).toBe(204);

    const listChild = await request(app).get('/resources').set('Authorization', `Bearer ${editorToken}`).query({ topicId: childId });
    expect(listChild.status).toBe(200);
    expect(listChild.body.length).toBe(0);
  });
});