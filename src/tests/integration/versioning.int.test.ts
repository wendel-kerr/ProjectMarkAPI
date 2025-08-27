import request from 'supertest';
import { app } from '../../app';

describe('Topics versioning (Phase 4)', () => {
  it('lists and retrieves versions after updates', async () => {
    // create a root
    const root = await request(app).post('/topics').send({ name: 'RootV', content: 'v1', parentId: null });
    expect(root.status).toBe(201);
    const rootId = root.body.id;

    // append two updates
    const u1 = await request(app).patch(`/topics/${rootId}`).send({ content: 'v2' });
    expect(u1.status).toBe(200);
    const u2 = await request(app).patch(`/topics/${rootId}`).send({ name: 'RootV2', content: 'v3' });
    expect(u2.status).toBe(200);
    expect(u2.body.version).toBeGreaterThan(2);

    // list versions
    const list = await request(app).get(`/topics/${rootId}/versions`);
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThanOrEqual(3);
    expect(list.body[0].version).toBe(1); // ascending order

    // get specific version
    const v1 = await request(app).get(`/topics/${rootId}/versions/1`);
    expect(v1.status).toBe(200);
    expect(v1.body.name).toBe('RootV');
    expect(v1.body.content).toBe('v1');

    // invalid version param
    const invalid = await request(app).get(`/topics/${rootId}/versions/abc`);
    expect(invalid.status).toBe(400);
  });

  it('returns 404 for versions of deleted or missing topic', async () => {
    // create and delete
    const t = await request(app).post('/topics').send({ name: 'ToDelete', content: 'x', parentId: null });
    const id = t.body.id;
    await request(app).delete(`/topics/${id}`).expect(204);

    // list versions after delete -> 404 (topic not found)
    const list = await request(app).get(`/topics/${id}/versions`);
    expect(list.status).toBe(404);
  });
});
