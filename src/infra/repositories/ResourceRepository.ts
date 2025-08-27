/**
 * ResourceRepository.ts
 * Repositório de resources com soft-delete.
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import { collections, ResourceRecord } from '../db/loki';
// Importações de dependências e tipos
import { randomUUID } from 'crypto';

// Declarações/exports principais
export class ResourceRepository {
  // Método principal da regra de negócio
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
  // Retorna o resultado da operação
    return rec;
  }

  // Método principal da regra de negócio
  getById(id: string): ResourceRecord | null {
    const rec = collections.resources.findOne({ id });
    if (!rec || rec.deletedAt) return null;
  // Retorna o resultado da operação
    return rec;
  }

  // Método principal da regra de negócio
  listByTopic(topicId: string): ResourceRecord[] {
  // Retorna o resultado da operação
    return collections.resources.find({ topicId }).filter((r: ResourceRecord) => !r.deletedAt);
  }

  // Método principal da regra de negócio
  update(id: string, update: { url?: string; description?: string; type?: string }): ResourceRecord | null {
    const rec = collections.resources.findOne({ id });
    if (!rec || rec.deletedAt) return null;
    if (update.url !== undefined) rec.url = update.url;
    if (update.description !== undefined) rec.description = update.description;
    if (update.type !== undefined) rec.type = update.type;
    rec.updatedAt = new Date();
    collections.resources.update(rec);
  // Retorna o resultado da operação
    return rec;
  }

  // Método principal da regra de negócio
  softDelete(id: string): boolean {
    const rec = collections.resources.findOne({ id });
    if (!rec || rec.deletedAt) return false;
    rec.deletedAt = new Date();
    collections.resources.update(rec);
  // Retorna o resultado da operação
    return true;
  }
}