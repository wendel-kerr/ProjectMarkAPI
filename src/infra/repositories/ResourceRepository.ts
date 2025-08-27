import { collections, ResourceRecord } from '../db/loki';

export class ResourceRepository {
  listByTopic(topicId: string): ResourceRecord[] {
    return collections.resources.find({ topicId });
  }
}
