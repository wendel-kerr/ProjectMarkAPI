import { z } from 'zod';
import { TopicRepository } from '../infra/repositories/TopicRepository';
import { toTopicDTO, TopicDTO } from '../infra/mappers/TopicMapper';

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
}
