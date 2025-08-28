
import { Router } from 'express';
import { TopicTreeService } from '../services/TopicTreeService';
import { TopicRepository } from '../infra/repositories/TopicRepository';
import { ResourceRepository } from '../infra/repositories/ResourceRepository';
import { requirePermission } from '../middleware/auth';

const repo = new TopicRepository();
const resourceRepo = new ResourceRepository();
const treeService = new TopicTreeService(repo, resourceRepo);

export const topicsTreeRouter = Router();

topicsTreeRouter.get('/:id/tree', requirePermission('read', 'topic'), async (req, res) => {
  try {
    const version = (req.query.version as any) ?? 'latest';
    const includeResources = req.query.includeResources === 'true';
    const tree = await treeService.getTree(req.params.id, version, includeResources);
    res.json(tree);
  } catch (e: any) {
    res.status(404).json({ message: 'Topic not found' });
  }
});
