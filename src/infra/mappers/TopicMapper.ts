/**
 * TopicMapper.ts
 * Conversão de registros Loki para DTOs expostos.
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import { TopicRecord, TopicVersionRecord, ResourceRecord, UserRecord } from '../db/loki';

// Declarações/exports principais
export type TopicDTO = {
  id: string;
  parentTopicId: string | null;
  name: string;
  content: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

// Declarações/exports principais
export type TopicVersionDTO = {
  topicId: string;
  version: number;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

// Declarações/exports principais
export type ResourceDTO = {
  id: string;
  topicId: string;
  url: string;
  description?: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

// Declarações/exports principais
export type PublicUserDTO = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  createdAt: Date;
  updatedAt: Date;
};

// Declarações/exports principais
export function toTopicDTO(topicRec: TopicRecord, versionRec: TopicVersionRecord): TopicDTO {
  // Retorna o resultado da operação
  return {
    id: topicRec.id,
    parentTopicId: topicRec.parentTopicId,
    name: versionRec.name,
    content: versionRec.content,
    version: versionRec.version,
    createdAt: topicRec.createdAt,
    updatedAt: versionRec.updatedAt,
  };
}

// Declarações/exports principais
export function toTopicVersionDTO(v: TopicVersionRecord): TopicVersionDTO {
  // Retorna o resultado da operação
  return {
    topicId: v.topicId,
    version: v.version,
    name: v.name,
    content: v.content,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
  };
}

// Declarações/exports principais
export function toResourceDTO(r: ResourceRecord) {
  // Retorna o resultado da operação
  return {
    id: r.id,
    topicId: r.topicId,
    url: r.url,
    description: r.description,
    type: r.type,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

// Declarações/exports principais
export function toPublicUserDTO(u: UserRecord): PublicUserDTO {
  // Retorna o resultado da operação
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}