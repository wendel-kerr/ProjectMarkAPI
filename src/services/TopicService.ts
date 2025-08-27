import { z } from 'zod';
import { TopicRepository } from '../infra/repositories/TopicRepository';
import { ResourceRepository } from '../infra/repositories/ResourceRepository';
import { toTopicDTO, TopicDTO, toTopicVersionDTO, TopicVersionDTO, TopicTreeDTO, toResourceDTO } from '../infra/mappers/TopicMapper';

const createTopicSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  parentId: z.string().uuid().nullable().optional(),
});

const updateTopicSchema = z.object({
  name: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
}).refine(data => data.name !== undefined || data.content !== undefined, {
  message: 'At least one field (name or content) must be provided',
});

export class TopicService {
  constructor(private readonly repo: TopicRepository) {}

  createTopic(input: unknown): TopicDTO {
    const { name, content, parentId } = createTopicSchema.parse(input);
    const res = parentId
      ? this.repo.createChild(parentId, { name, content })
      : this.repo.createRoot({ name, content });
    return toTopicDTO(res.topic, res.version);
  }

  getTopic(id: string): TopicDTO | null {
    const found = this.repo.getById(id);
    if (!found) return null;
    return toTopicDTO(found.topic, found.version);
  }

  listTopics(parentId: string | null): TopicDTO[] {
    const rows = this.repo.listByParent(parentId);
    return rows.map(r => toTopicDTO(r.topic, r.version));
  }

  updateTopic(id: string, input: unknown): TopicDTO | null {
    const update = updateTopicSchema.parse(input);
    const next = this.repo.appendVersion(id, update);
    if (!next) return null;
    const found = this.repo.getById(id)!;
    return toTopicDTO(found.topic, next);
  }

  deleteTopic(id: string): boolean {
    return this.repo.softDelete(id);
  }

  // Versioning passthrough (from Phase 4)
  listVersions(id: string): TopicVersionDTO[] | null {
    const arr = this.repo.listVersions(id);
    if (!arr) return null;
    return arr.map(toTopicVersionDTO);
  }
  getVersion(id: string, version: number): TopicVersionDTO | null {
    const v = this.repo.getVersion(id, version);
    if (!v) return null;
    return toTopicVersionDTO(v);
  }
}

export class TopicTreeService {
  constructor(
    private readonly topicRepo: TopicRepository,
    private readonly resourceRepo: ResourceRepository
  ) {}

  /**
   * Builds a recursive tree from a root topic.
   * @param version 'latest' or a specific number applied to ALL nodes (consistent snapshot)
   * @param includeResources if true, attach resources[] per node
   */
  getTree(rootId: string, version: 'latest' | number = 'latest', includeResources = false): TopicTreeDTO | null {
    // verify root exists
    const rootTopicRec = this.topicRepo.getTopicRecord(rootId);
    if (!rootTopicRec) return null;

    const resolveName = (topicId: string): { name: string; version: number } | null => {
      const vRec = version === 'latest'
        ? this.topicRepo.getVersion(topicId, this.topicRepo.getTopicRecord(topicId)!.currentVersion)!
        : this.topicRepo.getVersion(topicId, version);
      if (!vRec) return null;
      return { name: vRec.name, version: vRec.version };
    };

    const build = (topicId: string): TopicTreeDTO | null => {
      const tRec = this.topicRepo.getTopicRecord(topicId);
      if (!tRec) return null;
      const nm = resolveName(topicId);
      if (!nm) return null;

      const childRecs = this.topicRepo.listChildrenRecords(topicId);
      const children: TopicTreeDTO[] = [];
      for (const c of childRecs) {
        const node = build(c.id);
        if (node) children.push(node);
      }

      const node: TopicTreeDTO = {
        id: topicId,
        name: nm.name,
        version: nm.version,
        children,
      };

      if (includeResources) {
        const resources = this.resourceRepo.listByTopic(topicId).map(toResourceDTO);
        node.resources = resources;
      }
      return node;
    };

    return build(rootId);
  }
}
