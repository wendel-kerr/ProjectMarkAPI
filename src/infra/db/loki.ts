import Loki from 'lokijs';

export const db = new Loki('knowledge-base.db', {
  autoload: false, // we keep in-memory for this phase
});

export interface TopicRecord {
  id: string;
  parentTopicId: string | null;
  currentVersion: number; // pointer to latest snapshot
  createdAt: Date;
  updatedAt: Date;
}

export interface TopicVersionRecord {
  id: string;           // uuid for the version record
  topicId: string;
  version: number;
  name: string;
  content: string;
  createdAt: Date;      // first version time
  updatedAt: Date;      // time of this version creation
}

export interface ResourceRecord {
  id: string;
  topicId: string;
  url: string;
  description?: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  createdAt: Date;
}

export const collections = {
  topics: db.addCollection<TopicRecord>('topics', { unique: ['id'] }),
  topic_versions: db.addCollection<TopicVersionRecord>('topic_versions', { indices: ['topicId', 'version'] }),
  resources: db.addCollection<ResourceRecord>('resources', { indices: ['topicId'] }),
  users: db.addCollection<UserRecord>('users', { unique: ['id'] }),
};
