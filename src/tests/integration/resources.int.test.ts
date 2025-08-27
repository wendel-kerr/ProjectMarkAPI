import request from 'supertest';
import { app } from '../../app';

describe('Resources CRUD (Phase 6)', () => {
  it('creates, reads, lists by topic, updates and deletes resources; tree includes resources', async () => {
    // Create root topic
    const root = await request(app).post('/topics').send({ name: 'RootR', content: 'R', parentId: null });
    const rootId = root.body.id;

    // Create a child topic
    const child = await request(app).post('/topics').send({ name: 'ChildR', content: 'C', parentId: rootId });
    const childId = child.body.id;

    // Create resources on both nodes
    const r1 = await request(app).post('/resources').send({ topicId: rootId, url: 'https://example.com/a', type: 'link', description: 'Root link' });
    expect(r1.status).toBe(201);
    const r2 = await request(app).post('/resources').send({ topicId: childId, url: 'https://example.com/b', type: 'pdf', description: 'Child pdf' });
    expect(r2.status).toBe(201);

    // Get resource
    const r1get = await request(app).get(`/resources/${r1.body.id}`);
    expect(r1get.status).toBe(200);
    expect(r1get.body.url).toBe('https://example.com/a');

    // List by topic
    const listRoot = await request(app).get('/resources').query({ topicId: rootId });
    expect(listRoot.status).toBe(200);
    expect(listRoot.body.length).toBe(1);

    // Update resource
    const upd = await request(app).patch(`/resources/${r2.body.id}`).send({ description: 'Child pdf updated' });
    expect(upd.status).toBe(200);
    expect(upd.body.description).toBe('Child pdf updated');

    // Tree include resources
    const tree = await request(app).get(`/topics/${rootId}/tree`).query({ includeResources: 'true' });
    expect(tree.status).toBe(200);
    const txt = JSON.stringify(tree.body);
    expect(txt).toContain('https://example.com/a');
    expect(txt).toContain('https://example.com/b');

    // Delete resource
    const del = await request(app).delete(`/resources/${r2.body.id}`);
    expect(del.status).toBe(204);

    // List by topic after delete (should not include deleted)
    const listChild = await request(app).get('/resources').query({ topicId: childId });
    expect(listChild.status).toBe(200);
    expect(listChild.body.length).toBe(0);
  });
});
