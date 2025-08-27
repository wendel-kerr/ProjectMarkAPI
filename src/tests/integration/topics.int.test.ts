import request from 'supertest';
import { app } from '../../app';

describe('Topics routes (Phase 3)', () => {
  it('creates root and children, lists by parentId, updates and deletes with validations', async () => {
    // create a root
    const root = await request(app).post('/topics').send({ name: 'RootA', content: 'A', parentId: null });
    expect(root.status).toBe(201);
    const rootId = root.body.id;

    // create two children under RootA
    const c1 = await request(app).post('/topics').send({ name: 'ChildA', content: 'C1', parentId: rootId });
    expect(c1.status).toBe(201);
    const c2 = await request(app).post('/topics').send({ name: 'ChildB', content: 'C2', parentId: rootId });
    expect(c2.status).toBe(201);

    // list children
    const list = await request(app).get('/topics').query({ parentId: rootId });
    expect(list.status).toBe(200);
    expect(list.body.map((t: any) => t.name).sort()).toEqual(['ChildA', 'ChildB']);

    // duplicate name among siblings should fail (creating)
    const dup = await request(app).post('/topics').send({ name: 'ChildA', content: 'dup', parentId: rootId });
    expect(dup.status).toBe(409);

    // update ChildB name to ChildA should fail
    const updFail = await request(app).patch(`/topics/${c2.body.id}`).send({ name: 'ChildA' });
    expect(updFail.status).toBe(409);

    // update ChildB content (ok)
    const updOk = await request(app).patch(`/topics/${c2.body.id}`).send({ content: 'C2 updated' });
    expect(updOk.status).toBe(200);
    expect(updOk.body.content).toBe('C2 updated');
    expect(updOk.body.version).toBeGreaterThan(1); // version appended under the hood

    // soft delete ChildA
    const del = await request(app).delete(`/topics/${c1.body.id}`);
    expect(del.status).toBe(204);

    // list again (ChildA should be gone)
    const listAfter = await request(app).get('/topics').query({ parentId: rootId });
    expect(listAfter.status).toBe(200);
    expect(listAfter.body.map((t: any) => t.name)).toEqual(['ChildB']);
  });
});
