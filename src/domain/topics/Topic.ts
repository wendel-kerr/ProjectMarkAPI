import { TopicNode } from './TopicNode'; import { TopicTreeNode } from './ITopicComponent'; import { VersionedEntity } from '../versioning/VersionedEntity';
export type TopicSnapshot = { name: string; content: string; };
export class Topic extends VersionedEntity<TopicSnapshot> {
  private node: TopicNode;
  constructor(params: { id: string; name: string; content: string; parentId?: string|null }) {
    super(); this.node = new TopicNode({ id: params.id, name: params.name, parentId: params.parentId ?? null });
    this.createInitialVersion({ name: params.name, content: params.content });
  }
  get id(): string { return this.node.id; } get name(): string { return this.node.name; } set name(v: string) { this.node.name = v; } get parentId(): string|null { return this.node.parentId; }
  addChild(child: Topic): void { this.node.addChild(child.nodeAsComponent()); } removeChild(childId: string): void { this.node.removeChild(childId); }
  getChildren(): Topic[] { return this.node.getChildren() as Topic[]; } toTree(): TopicTreeNode { return this.node.toTree(); }
  private nodeAsComponent() { return this.node; }
  updateContent(update: Partial<TopicSnapshot>) { const v = this.createNewVersion(update); if (update.name) this.node.name = update.name; return v; }
}
