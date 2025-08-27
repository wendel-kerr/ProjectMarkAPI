import { z } from 'zod';
import { TopicRepository } from '../infra/repositories/TopicRepository';
import { toTopicDTO, TopicDTO } from '../infra/mappers/TopicMapper';

const createTopicSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  parentId: z.string().uuid().nullable().optional(),
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
}
