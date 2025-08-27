import { collections, ResourceRecord } from '../db/loki';
import { randomUUID } from 'crypto';

export class ResourceRepository {
  create(params: { topicId: string; url: string; description?: string; type: string }) {
    const now = new Date();
    const rec: ResourceRecord = {
      id: randomUUID(),
      topicId: params.topicId,
      url: params.url,
      description: params.description,
      type: params.type,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    collections.resources.insert(rec);
    return rec;
  }

  getById(id: string): ResourceRecord | null {
    const rec = collections.resources.findOne({ id });
    if (!rec || rec.deletedAt) return null;
    return rec;
  }

  listByTopic(topicId: string): ResourceRecord[] {
    return collections.resources.find({ topicId }).filter(r => !r.deletedAt);
  }

  update(id: string, update: { url?: string; description?: string; type?: string }): ResourceRecord | null {
    const rec = collections.resources.findOne({ id });
    if (!rec || rec.deletedAt) return null;
    if (update.url !== undefined) rec.url = update.url;
    if (update.description !== undefined) rec.description = update.description;
    if (update.type !== undefined) rec.type = update.type;
    rec.updatedAt = new Date();
    collections.resources.update(rec);
    return rec;
  }

  softDelete(id: string): boolean {
    const rec = collections.resources.findOne({ id });
    if (!rec || rec.deletedAt) return false;
    rec.deletedAt = new Date();
    collections.resources.update(rec);
    return true;
  }
}
