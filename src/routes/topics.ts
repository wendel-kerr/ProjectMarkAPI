import { Router } from 'express';
import { TopicRepository } from '../infra/repositories/TopicRepository';
import { TopicService } from '../services/TopicService';

const repo = new TopicRepository();
const service = new TopicService(repo);

export const topicsRouter = Router();

topicsRouter.post('/', (req, res, next) => {
  try {
    const dto = service.createTopic(req.body);
    res.status(201).json(dto);
  } catch (err: any) {
    if (typeof err.message === 'string' && err.message.startsWith('DuplicateSiblingName:')) {
      return res.status(409).json({ code: 'DUPLICATE_SIBLING_NAME', message: err.message });
    }
    if ((err as any)?.issues) return res.status(400).json({ code: 'VALIDATION_ERROR', issues: (err as any).issues });
    return next(err);
  }
});

topicsRouter.get('/', (req, res) => {
  const parentId = (req.query.parentId as string) ?? null;
  const list = service.listTopics(parentId === 'null' ? null : parentId);
  res.json(list);
});

topicsRouter.get('/:id', (req, res) => {
  const dto = service.getTopic(req.params.id);
  if (!dto) return res.status(404).json({ message: 'Topic not found' });
  res.json(dto);
});

topicsRouter.patch('/:id', (req, res, next) => {
  try {
    const dto = service.updateTopic(req.params.id, req.body);
    if (!dto) return res.status(404).json({ message: 'Topic not found' });
    res.json(dto);
  } catch (err: any) {
    if (typeof err.message === 'string' && err.message.startsWith('DuplicateSiblingName:')) {
      return res.status(409).json({ code: 'DUPLICATE_SIBLING_NAME', message: err.message });
    }
    if ((err as any)?.issues) return res.status(400).json({ code: 'VALIDATION_ERROR', issues: (err as any).issues });
    return next(err);
  }
});

topicsRouter.delete('/:id', (req, res) => {
  const ok = service.deleteTopic(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Topic not found' });
  res.status(204).send();
});
