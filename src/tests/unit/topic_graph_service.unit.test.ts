import { TopicGraphService } from '../../services/TopicGraphService';
import { TopicRepository } from '../../infra/repositories/TopicRepository';
import { TopicRecord, TopicVersionRecord } from '../../infra/db/loki';

/**
 * Testa o algoritmo de menor caminho (BFS) com um mock de TopicRepository.
 */
describe('TopicGraphService - unit', () => {
  // cria um grafo em memória
  const mkTopic = (id: string, parentTopicId: string | null, name: string, version=1): TopicRecord => ({
    id, parentTopicId, currentVersion: version, createdAt: new Date(), updatedAt: new Date(), deletedAt: null as any
  });

  const mkVersion = (topicId: string, version: number, name: string): TopicVersionRecord => ({
    id: `v-${topicId}-${version}`, topicId, version, name, content: name, createdAt: new Date(), updatedAt: new Date()
  });

  const nodes: Record<string, TopicRecord> = {
    A: mkTopic('A','', 'RootA' as any) as any,  // parentTopicId null (ajuste no TS)
    B: mkTopic('B','A', 'ChildB' as any) as any,
    C: mkTopic('C','B', 'GrandC' as any) as any,
    D: mkTopic('D',null, 'OtherD' as any) as any,
  };
  nodes.A.parentTopicId = null; // corrigindo null
  const versions: Record<string, TopicVersionRecord> = {
    'A@1': mkVersion('A',1,'RootA'),
    'B@1': mkVersion('B',1,'ChildB'),
    'C@1': mkVersion('C',1,'GrandC'),
    'D@1': mkVersion('D',1,'OtherD'),
  };

  // mock do repo com as 3 funções usadas pelo serviço
  const repoMock: Partial<TopicRepository> = {
    getTopicRecord: (id: string) => nodes[id] ?? null,
    listChildrenRecords: (id: string) => Object.values(nodes).filter(n => n.parentTopicId === id),
    getVersion: (id: string, version: number) => versions[`${id}@${version}`] ?? null,
  };

  const svc = new TopicGraphService(repoMock as TopicRepository);

  it('mesmo nó retorna path unitário', () => {
    const p = svc.shortestPath('A','A');
    expect(p.length).toBe(1);
    expect(p[0].id).toBe('A');
  });

  it('caminho A -> C tem 3 passos [A,B,C]', () => {
    const p = svc.shortestPath('A','C');
    expect(p.map(x => x.id)).toEqual(['A','B','C']);
  });

  it('sem caminho entre A e D (árvores diferentes) -> error', () => {
    expect(() => svc.shortestPath('A','D')).toThrow();
  });
});