import { z } from 'zod';
import { TopicRepository } from '../infra/repositories/TopicRepository';
import { ResourceRepository } from '../infra/repositories/ResourceRepository';
import { toTopicDTO, TopicDTO, toTopicVersionDTO, TopicVersionDTO, toResourceDTO } from '../infra/mappers/TopicMapper';

// Topic service
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

// Resource service
const createResourceSchema = z.object({
  topicId: z.string().uuid(),
  url: z.string().url(),
  description: z.string().max(1000).optional(),
  type: z.string().min(1),
});

const updateResourceSchema = z.object({
  url: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  type: z.string().min(1).optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field must be provided' });

export class ResourceService {
  constructor(
    private readonly topicRepo: TopicRepository,
    private readonly resourceRepo: ResourceRepository
  ) {}

  createResource(input: unknown) {
    const data = createResourceSchema.parse(input);
    const topic = this.topicRepo.getTopicRecord(data.topicId);
    if (!topic) throw new Error('TopicNotFound');
    const rec = this.resourceRepo.create(data);
    return toResourceDTO(rec);
  }

  getResource(id: string) {
    const rec = this.resourceRepo.getById(id);
    return rec ? toResourceDTO(rec) : null;
  }

  listByTopic(topicId: string) {
    const topic = this.topicRepo.getTopicRecord(topicId);
    if (!topic) throw new Error('TopicNotFound');
    return this.resourceRepo.listByTopic(topicId).map(toResourceDTO);
  }

  updateResource(id: string, input: unknown) {
    const update = updateResourceSchema.parse(input);
    const rec = this.resourceRepo.update(id, update);
    return rec ? toResourceDTO(rec) : null;
  }

  deleteResource(id: string) {
    return this.resourceRepo.softDelete(id);
  }
}

// Tree service DTO
export type TopicTreeDTO = {
  id: string;
  name: string;
  version: number;
  children: TopicTreeDTO[];
  resources?: ReturnType<typeof toResourceDTO>[];
};

export class TopicTreeService {
  constructor(
    private readonly topicRepo: TopicRepository,
    private readonly resourceRepo: ResourceRepository
  ) {}

  getTree(rootId: string, version: 'latest' | number = 'latest', includeResources = false): TopicTreeDTO | null {
    const rootTopicRec = this.topicRepo.getTopicRecord(rootId);
    if (!rootTopicRec) return null;

    const resolveName = (topicId: string): { name: string; version: number } | null => {
      const rec = this.topicRepo.getTopicRecord(topicId);
      if (!rec) return null;
      const ver = version === 'latest' ? rec.currentVersion : version;
      const vRec = this.topicRepo.getVersion(topicId, ver);
      if (!vRec) return null;
      return { name: vRec.name, version: vRec.version };
    };

    const build = (topicId: string): TopicTreeDTO | null => {
      const tRec = this.topicRepo.getTopicRecord(topicId);
      if (!tRec) return null;
      const nm = resolveName(topicId);
      if (!nm) return null;

      const childrenRecs = this.topicRepo.listChildrenRecords(topicId);
      const children: TopicTreeDTO[] = [];
      for (const child of childrenRecs) {
        const node = build(child.id);
        if (node) children.push(node);
      }

      const node: TopicTreeDTO = {
        id: topicId,
        name: nm.name,
        version: nm.version,
        children
      };

      if (includeResources) {
        node.resources = this.resourceRepo.listByTopic(topicId).map(toResourceDTO);
      }

      return node;
    };

    return build(rootId);
  }
}
