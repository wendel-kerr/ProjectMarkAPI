export interface TopicTreeNode { id: string; name: string; children: TopicTreeNode[]; }
export interface ITopicComponent {
  readonly id: string; name: string; parentId: string | null;
  addChild(child: ITopicComponent): void; removeChild(childId: string): void;
  getChildren(): ITopicComponent[]; toTree(): TopicTreeNode;
}
