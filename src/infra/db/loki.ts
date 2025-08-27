import Loki from 'lokijs';

export const db = new Loki('knowledge-base.db', { autoload: false });

export interface TopicRecord {
  id: string;
  parentTopicId: string | null;
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface TopicVersionRecord {
  id: string;
  topicId: string;
  version: number;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export const collections = {
  topics: db.addCollection<TopicRecord>('topics', { unique: ['id'], indices: ['parentTopicId', 'deletedAt'] }),
  topic_versions: db.addCollection<TopicVersionRecord>('topic_versions', { indices: ['topicId', 'version'] }),
  resources: db.addCollection<ResourceRecord>('resources', { indices: ['topicId', 'deletedAt'] }),
  users: db.addCollection<UserRecord>('users', { unique: ['id'], indices: ['email'] }),
};
