import { Topic } from '../../domain/topics/Topic';
import { TopicRecord, TopicVersionRecord } from '../db/loki';

export type TopicDTO = {
  id: string;
  parentTopicId: string | null;
  name: string;
  content: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
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
