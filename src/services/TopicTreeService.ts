
import { TopicRepository } from '../infra/repositories/TopicRepository';
import { ResourceRepository } from '../infra/repositories/ResourceRepository';
import { TopicTreeDTO } from '../infra/mappers/TopicMapper';

export class TopicTreeService {
  constructor(private repo: TopicRepository, private resourceRepo: ResourceRepository) {}

  async getTree(id: string, version: number | 'latest' = 'latest', includeResources = false): Promise<TopicTreeDTO> {
    const resolvedRootVersion =
      version === 'latest' ? this.repo.latestVersionNumber(id) : version;
    const nodeVersion = this.repo.getVersion(id, resolvedRootVersion);
    if (!nodeVersion) throw new Error('Topic not found');

    const node: TopicTreeDTO = {
      id: nodeVersion.topicId,
      name: nodeVersion.name,
      version: nodeVersion.version,
      children: [],
    };

    if (includeResources) {
      const resources = this.resourceRepo.listByTopic(id);
      node.resources = resources.map(r => ({
        id: r.id,
        url: r.url,
        description: r.description ?? '',
        type: r.type,
      }));
    }

    const children = this.repo.getChildren(id);
    for (const c of children) {
      const subtree = await this.getTree(c.id, version, includeResources);
      node.children.push(subtree);
    }
    return node;
  }
}
