import { collections, TopicRecord, TopicVersionRecord } from '../db/loki';
import { randomUUID } from 'crypto';

export class TopicRepository {
  createRoot(params: { id?: string; name: string; content: string }): { topic: TopicRecord; version: TopicVersionRecord } {
    const id = params.id ?? randomUUID();
    const now = new Date();
    const topic: TopicRecord = {
      id,
      parentTopicId: null,
      currentVersion: 1,
      createdAt: now,
      updatedAt: now,
    };
    collections.topics.insert(topic);

    const version: TopicVersionRecord = {
      id: randomUUID(),
      topicId: id,
      version: 1,
      name: params.name,
      content: params.content,
      createdAt: now,
      updatedAt: now,
    };
    collections.topic_versions.insert(version);
    return { topic, version };
  }

  createChild(parentId: string, params: { id?: string; name: string; content: string }) {
    const id = params.id ?? randomUUID();
    const now = new Date();
    const topic: TopicRecord = {
      id,
      parentTopicId: parentId,
      currentVersion: 1,
      createdAt: now,
      updatedAt: now,
    };
    collections.topics.insert(topic);
    const version: TopicVersionRecord = {
      id: randomUUID(),
      topicId: id,
      version: 1,
      name: params.name,
      content: params.content,
      createdAt: now,
      updatedAt: now,
    };
    collections.topic_versions.insert(version);
    return { topic, version };
  }

  getById(id: string) {
    const topic = collections.topics.findOne({ id });
    if (!topic) return null;
    const version = collections.topic_versions.findOne({ topicId: id, version: topic.currentVersion });
    if (!version) return null;
    return { topic, version };
  }

  getChildren(parentId: string) {
    return collections.topics.find({ parentTopicId: parentId });
  }

  updateVersionPointer(topicId: string, nextVersion: TopicVersionRecord) {
    const topic = collections.topics.findOne({ id: topicId });
    if (!topic) return null;
    topic.currentVersion = nextVersion.version;
    topic.updatedAt = nextVersion.updatedAt;
    collections.topics.update(topic);
    return topic;
  }

  appendVersion(topicId: string, update: { name?: string; content?: string }) {
    const latest = collections.topic_versions
      .chain()
      .find({ topicId })
      .simplesort('version', true)
      .limit(1)
      .data()[0];
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
    this.updateVersionPointer(topicId, next);
    return next;
  }
}
