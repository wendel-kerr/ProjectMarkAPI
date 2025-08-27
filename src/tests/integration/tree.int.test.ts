import request from 'supertest';
import { app } from '../../app';

describe('Topic tree (Phase 5)', () => {
  it('returns recursive tree and respects version param', async () => {
    // Create root and children
    const root = await request(app).post('/topics').send({ name: 'RootT', content: 'R1', parentId: null });
    const rootId = root.body.id;

    const c1 = await request(app).post('/topics').send({ name: 'ChildA', content: 'C1', parentId: rootId });
    const c2 = await request(app).post('/topics').send({ name: 'ChildB', content: 'C2', parentId: rootId });
    const gc1 = await request(app).post('/topics').send({ name: 'Grand', content: 'G1', parentId: c2.body.id });

    // Update ChildB name to test versioning in tree
    const upd = await request(app).patch(`/topics/${c2.body.id}`).send({ name: 'ChildB_NEW' });
    expect(upd.status).toBe(200);

    // Tree latest
    const latest = await request(app).get(`/topics/${rootId}/tree`).expect(200);
    expect(latest.body.name).toBe('RootT');
    const namesLatest = JSON.stringify(latest.body);
    expect(namesLatest).toContain('ChildA');
    expect(namesLatest).toContain('ChildB_NEW'); // latest should reflect new name
    expect(namesLatest).toContain('Grand');

    // Tree at version 1 (should show old name for ChildB)
    const v1 = await request(app).get(`/topics/${rootId}/tree`).query({ version: 1 }).expect(200);
    const namesV1 = JSON.stringify(v1.body);
    expect(namesV1).toContain('ChildA');
    expect(namesV1).toContain('ChildB');     // old name
    expect(namesV1).not.toContain('ChildB_NEW');
  });
});
