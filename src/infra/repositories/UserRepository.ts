import { collections, UserRecord } from '../db/loki';
import { randomUUID } from 'crypto';

export class UserRepository {
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
    return rec;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const rec = collections.users.findOne({ email: email.toLowerCase() });
    return rec ?? null;
  }

  async count(): Promise<number> {
    return collections.users.count();
  }
}
