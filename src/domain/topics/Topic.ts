import { TopicNode } from './TopicNode';
import { TopicTreeNode } from './ITopicComponent';
import { VersionedEntity } from '../versioning/VersionedEntity';

export type TopicSnapshot = {
  name: string;
  content: string;
};

/**
 * Topic aggregate composes a TopicNode (Composite) and a VersionedEntity for snapshots.
 */
export class Topic extends VersionedEntity<TopicSnapshot> {
  private node: TopicNode;

  constructor(params: { id: string; name: string; content: string; parentId?: string | null }) {
    super();
    this.node = new TopicNode({ id: params.id, name: params.name, parentId: params.parentId ?? null });
    this.createInitialVersion({ name: params.name, content: params.content });
  }

  // --- Composite facade ---
  get id(): string { return this.node.id; }
  get name(): string { return this.node.name; }
  set name(v: string) { this.node.name = v; }
  get parentId(): string | null { return this.node.parentId; }

  addChild(child: Topic): void { this.node.addChild(child.nodeAsComponent()); }
  removeChild(childId: string): void { this.node.removeChild(childId); }
  getChildren(): Topic[] { return this.node.getChildren() as Topic[]; }
  toTree(): TopicTreeNode { return this.node.toTree(); }

  // expose a COMPONENT view to plug into other nodes without exposing internals
  private nodeAsComponent() { return this.node; }

  // --- Versioning helpers ---
  updateContent(update: Partial<TopicSnapshot>) {
    const v = this.createNewVersion(update);
    // Keep node.name in sync if the version changed the name
    if (update.name) this.node.name = update.name;
    return v;
  }
}
