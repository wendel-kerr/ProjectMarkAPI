import { TopicRepository } from '../infra/repositories/TopicRepository';
import { toTopicTreeDTO, TopicTreeDTO } from '../infra/mappers/TopicTreeMapper';

export class TopicTreeService {
  constructor(private readonly repo: TopicRepository) {}

  buildTree(id: string, version: number|'latest'='latest', includeResources=false): TopicTreeDTO | null {
    const nodeVersion = this.repo.getVersion(id, version);
    const nodeRec = this.repo.getById(id)?.topic;
    if (!nodeRec || !nodeVersion) return null;

    const childrenRecs = this.repo.getChildren(id);
    const childrenTrees = childrenRecs.map(c => {
      const childVersion = this.repo.getVersion(c.id, version);
      if (!childVersion) return null;
      return this.buildTree(c.id, version, includeResources);
    }).filter(Boolean) as TopicTreeDTO[];

    return toTopicTreeDTO(nodeRec, nodeVersion, childrenTrees);
  }
}
