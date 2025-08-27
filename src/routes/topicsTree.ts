import { Router } from 'express';
import { TopicRepository } from '../infra/repositories/TopicRepository';
import { TopicTreeService } from '../services/TopicTreeService';

const repo = new TopicRepository();
const treeService = new TopicTreeService(repo);

export const topicsTreeRouter = Router();

topicsTreeRouter.get('/:id/tree', (req, res) => {
  const versionParam = req.query.version as string | undefined;
  let version: number|'latest' = 'latest';
  if (versionParam && versionParam !== 'latest') {
    const n = Number(versionParam);
    if (!Number.isInteger(n) || n <= 0) return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'version must be positive integer or latest' });
    version = n;
  }

  const includeResources = req.query.includeResources === 'true';

  const tree = treeService.buildTree(req.params.id, version, includeResources);
  if (!tree) return res.status(404).json({ message: 'Topic not found' });
  res.json(tree);
});
