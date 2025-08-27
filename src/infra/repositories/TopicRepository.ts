/**
 * TopicRepository.ts
 * Repositório de tópicos com versionamento e validações.
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import { collections, TopicRecord, TopicVersionRecord } from '../db/loki';
// Importações de dependências e tipos
import { TopicVersionFactory } from '../../domain/versioning/TopicVersionFactory';
// Importações de dependências e tipos
import { randomUUID } from 'crypto';

// Declarações/exports principais
export class TopicRepository {
  private notDeletedFilter(rec: TopicRecord) { return !rec.deletedAt; }

  // Método principal da regra de negócio
  private getLatestVersion(topicId: string): TopicVersionRecord | null {
    const v = collections.topic_versions
      .chain()
      .find({ topicId })
      .simplesort('version', true)
      .limit(1)
      .data()[0];
  // Retorna o resultado da operação
    return v ?? null;
  }

  private siblingsWithSameName(parentId: string | null, name: string, exceptId?: string): TopicRecord[] {
    const siblings = collections.topics.find({ parentTopicId: parentId }) as TopicRecord[];
    const filtered = siblings.filter((t: TopicRecord) =>
      this.notDeletedFilter(t) && (!exceptId || t.id !== exceptId)
    );
  // Retorna o resultado da operação
    return filtered.filter((t: TopicRecord) => {
      const v = this.getLatestVersion(t.id);
  // Retorna o resultado da operação
      return v?.name === name;
    });
  }

  // Método principal da regra de negócio
  createRoot(params: { id?: string; name: string; content: string }) {
    if (this.siblingsWithSameName(null, params.name).length > 0) {
      throw new Error(`DuplicateSiblingName:${params.name}`);
    }
    const id = params.id ?? randomUUID();
    const now = new Date();
    const topic: TopicRecord = { id, parentTopicId: null, currentVersion: 1, createdAt: now, updatedAt: now, deletedAt: null };
    collections.topics.insert(topic);
    const version: TopicVersionRecord = TopicVersionFactory.createInitial({ topicId: id, name: params.name, content: params.content });
    collections.topic_versions.insert(version);
  // Retorna o resultado da operação
    return { topic, version };
  }

  // Método principal da regra de negócio
  createChild(parentId: string, params: { id?: string; name: string; content: string }) {
    const parent = collections.topics.findOne({ id: parentId });
    if (!parent || parent.deletedAt) throw new Error('ParentNotFound');
    if (this.siblingsWithSameName(parentId, params.name).length > 0) throw new Error(`DuplicateSiblingName:${params.name}`);
    const id = params.id ?? randomUUID();
    const now = new Date();
    const topic: TopicRecord = { id, parentTopicId: parentId, currentVersion: 1, createdAt: now, updatedAt: now, deletedAt: null };
    collections.topics.insert(topic);
    const version: TopicVersionRecord = TopicVersionFactory.createInitial({ topicId: id, name: params.name, content: params.content });
    collections.topic_versions.insert(version);
  // Retorna o resultado da operação
    return { topic, version };
  }

  // Método principal da regra de negócio
  getById(id: string) {
    const topic = collections.topics.findOne({ id });
    if (!topic || topic.deletedAt) return null;
    const version = collections.topic_versions.findOne({ topicId: id, version: topic.currentVersion });
    if (!version) return null;
  // Retorna o resultado da operação
    return { topic, version };
  }

  // Método principal da regra de negócio
  getTopicRecord(id: string): TopicRecord | null {
    const topic = collections.topics.findOne({ id });
    if (!topic || topic.deletedAt) return null;
  // Retorna o resultado da operação
    return topic;
  }

  // Método principal da regra de negócio
  listByParent(parentId: string | null) {
    const topics = (collections.topics.find({ parentTopicId: parentId }) as TopicRecord[])
      .filter((t: TopicRecord) => this.notDeletedFilter(t));

  // Retorna o resultado da operação
    return topics
      .map((t: TopicRecord) => {
        const v = collections.topic_versions.findOne({ topicId: t.id, version: t.currentVersion }) as TopicVersionRecord | null;
  // Retorna o resultado da operação
        return v ? { topic: t, version: v } : null;
      })
      .filter((x): x is { topic: TopicRecord; version: TopicVersionRecord } => Boolean(x));
  }

  // Método principal da regra de negócio
  listChildrenRecords(parentId: string): TopicRecord[] {
  // Retorna o resultado da operação
    return (collections.topics.find({ parentTopicId: parentId }) as TopicRecord[])
      .filter((t: TopicRecord) => this.notDeletedFilter(t));
  }

  // Método principal da regra de negócio
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
    const next: TopicVersionRecord = TopicVersionFactory.createNext({ topicId, previous: latest, patch: update });
    collections.topic_versions.insert(next);
    topic.currentVersion = next.version;
    topic.updatedAt = now;
    collections.topics.update(topic);
  // Retorna o resultado da operação
    return next;
  }

  // Método principal da regra de negócio
  softDelete(topicId: string) {
    const topic = collections.topics.findOne({ id: topicId });
    if (!topic || topic.deletedAt) return false;
    topic.deletedAt = new Date();
    collections.topics.update(topic);
  // Retorna o resultado da operação
    return true;
  }

  // Método principal da regra de negócio
  listVersions(topicId: string): TopicVersionRecord[] | null {
    const topic = collections.topics.findOne({ id: topicId });
    if (!topic || topic.deletedAt) return null;
  // Retorna o resultado da operação
    return collections.topic_versions
      .chain()
      .find({ topicId })
      .simplesort('version', false)
      .data();
  }

  // Método principal da regra de negócio
  getVersion(topicId: string, version: number): TopicVersionRecord | null {
    const topic = collections.topics.findOne({ id: topicId });
    if (!topic || topic.deletedAt) return null;
  // Retorna o resultado da operação
    return collections.topic_versions.findOne({ topicId, version }) ?? null;
  }
}