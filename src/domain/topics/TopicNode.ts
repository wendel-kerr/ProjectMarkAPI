import { ITopicComponent, TopicTreeNode } from './ITopicComponent';
export class TopicNode implements ITopicComponent {
  public readonly id: string; public name: string; public parentId: string | null; private children: ITopicComponent[] = [];
  constructor(params: { id: string; name: string; parentId?: string|null }) { this.id=params.id; this.name=params.name; this.parentId=params.parentId ?? null; }
  addChild(child: ITopicComponent): void { this.children.push(child); }
  removeChild(childId: string): void { this.children = this.children.filter(c => c.id !== childId); }
  getChildren(): ITopicComponent[] { return [...this.children]; }
  toTree(): TopicTreeNode { return { id: this.id, name: this.name, children: this.children.map(c => c.toTree()) }; }
}
