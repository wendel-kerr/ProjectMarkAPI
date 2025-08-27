import { Topic, TopicSnapshot } from './Topic';

export class TopicFactory {
  static createRoot(params: { id: string; name: string; content: string }): Topic {
    return new Topic({ id: params.id, name: params.name, content: params.content, parentId: null });
    }

  static createChild(parent: Topic, params: { id: string; name: string; content: string }): Topic {
    const child = new Topic({ id: params.id, name: params.name, content: params.content, parentId: parent.id });
    parent.addChild(child);
    return child;
  }

  /**
   * Creates a new immutable version snapshot for a Topic by merging the update.
   */
  static nextVersion(topic: Topic, update: Partial<TopicSnapshot>) {
    return topic.updateContent(update);
  }
}
