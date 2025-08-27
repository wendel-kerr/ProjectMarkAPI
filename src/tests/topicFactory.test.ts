import { TopicFactory } from '../domain/topics/TopicFactory';

describe('Topic Factory + Versioning', () => {
  it('creates v1 and v2 snapshots', () => {
    const t = TopicFactory.createRoot({ id: 't1', name: 'Messaging', content: 'Intro' });
    const v1 = t.getLatestVersion();
    expect(v1.version).toBe(1);
    expect(v1.data.content).toBe('Intro');

    const v2 = TopicFactory.nextVersion(t, { content: 'Intro + Kafka' });
    expect(v2.version).toBe(2);
    expect(t.getLatestVersion().data.content).toBe('Intro + Kafka');
  });
});
