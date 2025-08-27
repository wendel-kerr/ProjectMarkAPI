import { TopicRecord, TopicVersionRecord, ResourceRecord } from '../db/loki';

export type TopicDTO = {
  id: string;
  parentTopicId: string | null;
  name: string;
  content: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TopicVersionDTO = {
  topicId: string;
  version: number;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ResourceDTO = {
  id: string;
  url: string;
  description?: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TopicTreeDTO = {
  id: string;
  name: string;
  version: number;
  children: TopicTreeDTO[];
  resources?: ResourceDTO[];
};

export function toTopicDTO(topicRec: TopicRecord, versionRec: TopicVersionRecord): TopicDTO {
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

export function toTopicVersionDTO(v: TopicVersionRecord): TopicVersionDTO {
  return {
    topicId: v.topicId,
    version: v.version,
    name: v.name,
    content: v.content,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
  };
}

export function toResourceDTO(r: ResourceRecord): ResourceDTO {
  return {
    id: r.id,
    url: r.url,
    description: r.description,
    type: r.type,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}
