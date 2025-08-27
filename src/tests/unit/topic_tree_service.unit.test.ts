import { TopicTreeService } from '../../services/Services';
import { TopicRepository } from '../../infra/repositories/TopicRepository';
import { ResourceRepository } from '../../infra/repositories/ResourceRepository';
import { TopicRecord, TopicVersionRecord, ResourceRecord } from '../../infra/db/loki';

/**
 * Testa a construção da árvore com e sem resources usando mocks.
 */
describe('TopicTreeService - unit', () => {
  const mkTopic = (id: string, parentTopicId: string | null, name: string): TopicRecord => ({
    id, parentTopicId, currentVersion: 1, createdAt: new Date(), updatedAt: new Date(), deletedAt: null as any
  });
  const mkVersion = (topicId: string, name: string): TopicVersionRecord => ({
    id: `v-${topicId}-1`, topicId, version: 1, name, content: name, createdAt: new Date(), updatedAt: new Date()
  });
  const tRoot = mkTopic('R', null, 'Root');
  const tChild = mkTopic('C', 'R', 'Child');

  const versions: Record<string, TopicVersionRecord> = {
    'R@1': mkVersion('R','Root'),
    'C@1': mkVersion('C','Child'),
  };

  const resources: ResourceRecord[] = [{
    id: 'res1', topicId: 'C', url: 'https://ex.com', description: 'link', type: 'link',
    createdAt: new Date(), updatedAt: new Date(), deletedAt: null as any
  }];

  const topicRepoMock: Partial<TopicRepository> = {
    getTopicRecord: (id: string) => id === 'R' ? tRoot : (id === 'C' ? tChild : null),
    getVersion: (id: string, version: number) => versions[`${id}@${version}`] ?? null,
    listChildrenRecords: (id: string) => id === 'R' ? [tChild] : [],
  };

  const resRepoMock: Partial<ResourceRepository> = {
    listByTopic: (id: string) => resources.filter(r => r.topicId === id),
  };

  const svc = new TopicTreeService(topicRepoMock as TopicRepository, resRepoMock as ResourceRepository);

  it('árvore sem resources', () => {
    const tree = svc.getTree('R','latest',false);
    expect(tree?.children.length).toBe(1);
    expect((tree as any).resources).toBeUndefined();
  });

  it('árvore com resources no filho', () => {
    const tree = svc.getTree('R','latest',true);
    expect(tree?.children[0].resources?.length).toBe(1);
  });
});