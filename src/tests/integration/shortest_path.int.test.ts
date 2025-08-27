import request from 'supertest';
import app from '../../app';

let editorToken: string;
let viewerToken: string;

beforeAll(async () => {
  await request(app).post('/auth/seed-defaults').send({});

  const editor = await request(app).post('/auth/login').send({ email: 'editor@example.com', password: 'password' });
  expect(editor.status).toBe(200);
  editorToken = editor.body.token;

  const viewer = await request(app).post('/auth/login').send({ email: 'viewer@example.com', password: 'password' });
  expect(viewer.status).toBe(200);
  viewerToken = viewer.body.token;
});

describe('Shortest path between topics (Item 1)', () => {
  it('returns shortest path for connected nodes and 422 for disconnected', async () => {
    const root = await request(app).post('/topics').set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'SP-Root', content: 'root', parentId: null });
    expect(root.status).toBe(201);
    const rootId = root.body.id;

    const child = await request(app).post('/topics').set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'SP-Child', content: 'child', parentId: rootId });
    expect(child.status).toBe(201);
    const childId = child.body.id;

    const grand = await request(app).post('/topics').set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'SP-Grand', content: 'grand', parentId: childId });
    expect(grand.status).toBe(201);
    const grandId = grand.body.id;

    const otherRoot = await request(app).post('/topics').set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'SP-Other', content: 'other', parentId: null });
    expect(otherRoot.status).toBe(201);
    const otherId = otherRoot.body.id;

    const ok = await request(app).get('/topics/shortest-path').set('Authorization', `Bearer ${viewerToken}`)
      .query({ from: rootId, to: grandId });
    expect(ok.status).toBe(200);
    expect(Array.isArray(ok.body.path)).toBe(true);
    expect(ok.body.path.length).toBe(3);

    const noPath = await request(app).get('/topics/shortest-path').set('Authorization', `Bearer ${viewerToken}`)
      .query({ from: rootId, to: otherId });
    expect(noPath.status).toBe(422);
    expect(noPath.body.code).toBe('NO_PATH');
  });

  it('returns 404 if any node does not exist', async () => {
    const fake = '11111111-1111-1111-1111-111111111111';
    const res = await request(app).get('/topics/shortest-path').set('Authorization', `Bearer ${viewerToken}`)
      .query({ from: fake, to: fake });
    expect(res.status).toBe(404);
  });
});