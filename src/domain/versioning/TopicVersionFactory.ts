/**
 * TopicVersionFactory.ts
 * Factory explícita para criar versões de tópico.
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import { TopicVersionRecord } from '../../infra/db/loki';
// Importações de dependências e tipos
import { randomUUID } from 'crypto';

/**
 * TopicVersionFactory
 * - createInitial: primeira versão (v1)
 * - createNext: clona dados da versão anterior e aplica patch (v+1)
 * Mantém createdAt da versão inicial e atualiza updatedAt para "now".
 */
// Declarações/exports principais
export class TopicVersionFactory {
  static createInitial(params: { topicId: string; name: string; content: string; now?: Date }): TopicVersionRecord {
    const now = params.now ?? new Date();
  // Retorna o resultado da operação
    return {
      id: randomUUID(),
      topicId: params.topicId,
      version: 1,
      name: params.name,
      content: params.content,
      createdAt: now,
      updatedAt: now,
    };
  }

  static createNext(params: { topicId: string; previous: TopicVersionRecord; patch: { name?: string; content?: string }; now?: Date }): TopicVersionRecord {
    const now = params.now ?? new Date();
  // Retorna o resultado da operação
    return {
      id: randomUUID(),
      topicId: params.topicId,
      version: params.previous.version + 1,
      name: params.patch.name ?? params.previous.name,
      content: params.patch.content ?? params.previous.content,
      createdAt: params.previous.createdAt,
      updatedAt: now,
    };
  }
}