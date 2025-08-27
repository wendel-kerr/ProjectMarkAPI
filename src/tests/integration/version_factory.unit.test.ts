import request from 'supertest';
import app from '../../app';

describe('TopicVersionFactory behavior', () => {
  let token: string = '';

  beforeAll(async () => {
    await request(app).post('/auth/seed-defaults').send({});
    const res = await request(app).post('/auth/login').send({ email: 'editor@example.com', password: 'password' });
    token = res.body.token;
  });

  it('keeps createdAt from v1 and increments version while updating updatedAt', async () => {
    const create = await request(app)
      .post('/topics')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'FactoryRoot', content: 'v1', parentId: null });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const v1 = await request(app).get(`/topics/${id}/versions/1`).set('Authorization', `Bearer ${token}`);
    expect(v1.status).toBe(200);
    const createdAtV1 = new Date(v1.body.createdAt).toISOString();
    const updatedAtV1 = new Date(v1.body.updatedAt).toISOString();

    // wait a tick (no real sleep in jest here; just create a new version)
    const upd = await request(app)
      .patch(`/topics/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'v2' });
    expect(upd.status).toBe(200);

    const v2 = await request(app).get(`/topics/${id}/versions/2`).set('Authorization', `Bearer ${token}`);
    expect(v2.status).toBe(200);

    // createdAt must be equal; updatedAt must be >=
    const createdAtV2 = new Date(v2.body.createdAt).toISOString();
    const updatedAtV2 = new Date(v2.body.updatedAt).toISOString();

    expect(createdAtV2).toBe(createdAtV1);
    expect(new Date(updatedAtV2).getTime()).toBeGreaterThanOrEqual(new Date(updatedAtV1).getTime());
  });
});
