/**
 * TopicGraphService.ts
 * Algoritmo BFS para menor caminho entre tópicos.
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import { TopicRepository } from '../infra/repositories/TopicRepository';

// Declarações/exports principais
export type PathNodeDTO = { id: string; name: string; version: number };

// Declarações/exports principais
export class TopicGraphService {
  // Construtor injeta dependências necessárias
  constructor(private readonly topicRepo: TopicRepository) {}

  // Método principal da regra de negócio
  shortestPath(fromId: string, toId: string): PathNodeDTO[] {
    if (fromId === toId) {
      const single = this.resolveNode(fromId);
      if (!single) throw new Error('TopicNotFound');
  // Retorna o resultado da operação
      return [single];
    }

    const start = this.topicRepo.getTopicRecord(fromId);
    const goal = this.topicRepo.getTopicRecord(toId);
    if (!start || !goal) throw new Error('TopicNotFound');

    const visited = new Set<string>();
    const queue: string[] = [fromId];
    const parent = new Map<string, string | null>();
    parent.set(fromId, null);
    visited.add(fromId);

    while (queue.length > 0) {
      const current = queue.shift() as string;
      if (current === toId) {
  // Retorna o resultado da operação
        return this.reconstructPath(parent, toId);
      }

      for (const nb of this.neighbors(current)) {
        if (!visited.has(nb)) {
          visited.add(nb);
          parent.set(nb, current);
          queue.push(nb);
        }
      }
    }

    throw new Error('NoPath');
  }

  private neighbors(id: string): string[] {
    const rec = this.topicRepo.getTopicRecord(id);
    if (!rec) return [];
    const result: string[] = [];

    if (rec.parentTopicId) {
      const parent = this.topicRepo.getTopicRecord(rec.parentTopicId);
      if (parent) result.push(parent.id);
    }

    const children = this.topicRepo.listChildrenRecords(id);
    for (const c of children) result.push(c.id);

  // Retorna o resultado da operação
    return result;
  }

  private reconstructPath(parent: Map<string, string | null>, endId: string): PathNodeDTO[] {
    const ids: string[] = [];
    let cur: string | null = endId;
    while (cur) {
      ids.push(cur);
      cur = parent.get(cur) ?? null;
    }
    ids.reverse();
    const path = ids.map(id => this.resolveNode(id));
    if (path.some(p => !p)) throw new Error('TopicNotFound');
  // Retorna o resultado da operação
    return path as PathNodeDTO[];
  }

  private resolveNode(id: string): PathNodeDTO | null {
    const rec = this.topicRepo.getTopicRecord(id);
    if (!rec) return null;
    const ver = this.topicRepo.getVersion(id, rec.currentVersion);
    if (!ver) return null;
  // Retorna o resultado da operação
    return { id, name: ver.name, version: ver.version };
  }
}