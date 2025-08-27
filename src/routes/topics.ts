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
  } catch (err) {
    next(err);
  }
});

topicsRouter.get('/:id', (req, res) => {
  const dto = service.getTopic(req.params.id);
  if (!dto) return res.status(404).json({ message: 'Topic not found' });
  res.json(dto);
});
