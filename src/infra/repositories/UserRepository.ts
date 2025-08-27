/**
 * UserRepository.ts
 * Repositório de usuários.
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import { collections, UserRecord } from '../db/loki';
// Importações de dependências e tipos
import { randomUUID } from 'crypto';

// Declarações/exports principais
export class UserRepository {
  // Método principal da regra de negócio
  async create(params: { name: string; email: string; role: 'Admin'|'Editor'|'Viewer'; passwordHash: string }) {
    const now = new Date();
    const rec: UserRecord = {
      id: randomUUID(),
      name: params.name,
      email: params.email.toLowerCase(),
      role: params.role,
      passwordHash: params.passwordHash,
      createdAt: now,
      updatedAt: now,
    };
    collections.users.insert(rec);
  // Retorna o resultado da operação
    return rec;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const rec = collections.users.findOne({ email: email.toLowerCase() });
  // Retorna o resultado da operação
    return rec ?? null;
  }

  async count(): Promise<number> {
  // Retorna o resultado da operação
    return collections.users.count();
  }
}