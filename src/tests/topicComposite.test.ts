import { TopicFactory } from '../domain/topics/TopicFactory';

describe('Topic Composite (toTree)', () => {
  it('builds a tree from root with children', () => {
    const root = TopicFactory.createRoot({ id: 'root', name: 'Architecture', content: 'Root content' });
    const child1 = TopicFactory.createChild(root, { id: 'c1', name: 'API Gateway', content: 'C1 content' });
    const child2 = TopicFactory.createChild(root, { id: 'c2', name: 'Observability', content: 'C2 content' });
    const grandchild = TopicFactory.createChild(child2, { id: 'gc1', name: 'Tracing', content: 'GC content' });

    const tree = root.toTree();
    expect(tree).toEqual({
      id: 'root',
      name: 'Architecture',
      children: [
        { id: 'c1', name: 'API Gateway', children: [] },
        { id: 'c2', name: 'Observability', children: [
          { id: 'gc1', name: 'Tracing', children: [] }
        ]},
      ],
    });
  });
});
