import { Identifiable, Timestamped } from '../common/BaseTypes';

export type ResourceType = 'video' | 'article' | 'pdf' | 'link' | string;

export interface IResource extends Identifiable, Timestamped {
  topicId: string;
  url: string;
  description?: string;
  type: ResourceType;
}
