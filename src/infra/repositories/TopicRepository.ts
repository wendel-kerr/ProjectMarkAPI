import { collections, TopicRecord, TopicVersionRecord } from '../db/loki';
import { randomUUID } from 'crypto';

export class TopicRepository {
  private notDeletedFilter(rec: TopicRecord) { return !rec.deletedAt; }

  private getLatestVersion(topicId: string): TopicVersionRecord | null {
    const v = collections.topic_versions
      .chain()
      .find({ topicId })
      .simplesort('version', true)
      .limit(1)
      .data()[0];
    return v ?? null;
  }

  private siblingsWithSameName(parentId: string | null, name: string, exceptId?: string): TopicRecord[] {
    const siblings = collections.topics.find({ parentTopicId: parentId });
    const filtered = siblings.filter(t => this.notDeletedFilter(t) && (!exceptId || t.id !== exceptId));
    return filtered.filter(t => {
      const v = this.getLatestVersion(t.id);
      return v?.name === name;
    });
  }

  createRoot(params: { id?: string; name: string; content: string }) {
    if (this.siblingsWithSameName(null, params.name).length > 0) {
      throw new Error(`DuplicateSiblingName:${params.name}`);
    }
    const id = params.id ?? randomUUID();
    const now = new Date();
    const topic: TopicRecord = { id, parentTopicId: null, currentVersion: 1, createdAt: now, updatedAt: now, deletedAt: null };
    collections.topics.insert(topic);
    const version: TopicVersionRecord = { id: randomUUID(), topicId: id, version: 1, name: params.name, content: params.content, createdAt: now, updatedAt: now };
    collections.topic_versions.insert(version);
    return { topic, version };
  }

  createChild(parentId: string, params: { id?: string; name: string; content: string }) {
    const parent = collections.topics.findOne({ id: parentId });
    if (!parent || parent.deletedAt) throw new Error('ParentNotFound');
    if (this.siblingsWithSameName(parentId, params.name).length > 0) {
      throw new Error(`DuplicateSiblingName:${params.name}`);
    }
    const id = params.id ?? randomUUID();
    const now = new Date();
    const topic: TopicRecord = { id, parentTopicId: parentId, currentVersion: 1, createdAt: now, updatedAt: now, deletedAt: null };
    collections.topics.insert(topic);
    const version: TopicVersionRecord = { id: randomUUID(), topicId: id, version: 1, name: params.name, content: params.content, createdAt: now, updatedAt: now };
    collections.topic_versions.insert(version);
    return { topic, version };
  }

  getById(id: string) {
    const topic = collections.topics.findOne({ id });
    if (!topic || topic.deletedAt) return null;
    const version = collections.topic_versions.findOne({ topicId: id, version: topic.currentVersion });
    if (!version) return null;
    return { topic, version };
  }

  listByParent(parentId: string | null) {
    const topics = collections.topics.find({ parentTopicId: parentId }).filter(this.notDeletedFilter);
    return topics.map(t => {
      const v = collections.topic_versions.findOne({ topicId: t.id, version: t.currentVersion });
      return v ? { topic: t, version: v } : null;
    }).filter(Boolean) as { topic: TopicRecord; version: TopicVersionRecord }[];
  }

  appendVersion(topicId: string, update: { name?: string; content?: string }) {
    const topic = collections.topics.findOne({ id: topicId });
    if (!topic || topic.deletedAt) return null;
    if (update.name) {
      const siblings = this.siblingsWithSameName(topic.parentTopicId, update.name, topicId);
      if (siblings.length > 0) throw new Error(`DuplicateSiblingName:${update.name}`);
    }
    const latest = this.getLatestVersion(topicId);
    if (!latest) return null;
    const now = new Date();
    const next: TopicVersionRecord = {
      id: randomUUID(),
      topicId,
      version: latest.version + 1,
      name: update.name ?? latest.name,
      content: update.content ?? latest.content,
      createdAt: latest.createdAt,
      updatedAt: now,
    };
    collections.topic_versions.insert(next);
    topic.currentVersion = next.version;
    topic.updatedAt = now;
    collections.topics.update(topic);
    return next;
  }

  softDelete(topicId: string) {
    const topic = collections.topics.findOne({ id: topicId });
    if (!topic || topic.deletedAt) return false;
    topic.deletedAt = new Date();
    collections.topics.update(topic);
    return true;
  }

  // --- Versioning specific ---
  listVersions(topicId: string): TopicVersionRecord[] | null {
    const topic = collections.topics.findOne({ id: topicId });
    if (!topic || topic.deletedAt) return null;
    return collections.topic_versions
      .chain()
      .find({ topicId })
      .simplesort('version', false) // ascending
      .data();
  }

  getVersion(topicId: string, version: number): TopicVersionRecord | null {
    const topic = collections.topics.findOne({ id: topicId });
    if (!topic || topic.deletedAt) return null;
    return collections.topic_versions.findOne({ topicId, version }) ?? null;
  }
}
