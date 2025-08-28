/**
 * loki.ts
 * Configuração do Loki e tipos de registro (tabelas in-memory).
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import Loki from 'lokijs';

// Declarações/exports principais
export const db = new Loki('knowledge-base.db', { autoload: false });

// Declarações/exports principais
export interface TopicRecord {
  id: string;
  parentTopicId: string | null;
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// Declarações/exports principais
export interface TopicVersionRecord {
  id: string;
  topicId: string;
  version: number;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Declarações/exports principais
export interface ResourceRecord {
  id: string;
  topicId: string;
  url: string;
  description?: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// Declarações/exports principais
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

// Declarações/exports principais
export const collections = {
  topics: db.addCollection('topics', { unique: ['id'], indices: ['parentTopicId', 'deletedAt'] }),
  topic_versions: db.addCollection('topic_versions', { indices: ['topicId', 'version'] }),
  resources: db.addCollection('resources', { indices: ['topicId', 'deletedAt'] }),
  users: db.addCollection('users', { unique: ['id'], indices: ['email'] }),
};
