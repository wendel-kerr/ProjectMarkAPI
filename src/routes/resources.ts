/**
 * resources.ts
 * Rotas de resources: CRUD e listagem por tópico.
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import { Router } from 'express';
// Importações de dependências e tipos
import { TopicRepository } from '../infra/repositories/TopicRepository';
// Importações de dependências e tipos
import { ResourceRepository } from '../infra/repositories/ResourceRepository';
// Importações de dependências e tipos
import { ResourceService } from '../services/Services';
// Importações de dependências e tipos
import { authGuard, requirePermission } from '../middleware/auth';

const topicRepo = new TopicRepository();
const resourceRepo = new ResourceRepository();
const service = new ResourceService(topicRepo, resourceRepo);

// Declarações/exports principais
export const resourcesRouter = Router();

  // Definição de rota HTTP
resourcesRouter.use(authGuard);

  // Definição de rota HTTP
resourcesRouter.post('/', requirePermission('write', 'resource'), (req, res, next) => {
  try {
    const dto = service.createResource(req.body);
    res.status(201).json(dto);
  } catch (err: any) {
    if ((err as any)?.issues) return res.status(400).json({ code: 'VALIDATION_ERROR', issues: (err as any).issues });
    if (err?.message === 'TopicNotFound') return res.status(404).json({ code: 'TOPIC_NOT_FOUND' });
  // Retorna o resultado da operação
    return next(err);
  }
});

  // Definição de rota HTTP
resourcesRouter.get('/:id', requirePermission('read', 'resource'), (req, res) => {
  const dto = service.getResource(req.params.id);
  if (!dto) return res.status(404).json({ message: 'Resource not found' });
  res.json(dto);
});

  // Definição de rota HTTP
resourcesRouter.get('/', requirePermission('read', 'resource'), (req, res, next) => {
  const topicId = req.query.topicId as string | undefined;
  if (!topicId) return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'topicId is required' });
  try {
    const list = service.listByTopic(topicId);
    res.json(list);
  } catch (err: any) {
    if (err?.message === 'TopicNotFound') return res.status(404).json({ code: 'TOPIC_NOT_FOUND' });
  // Retorna o resultado da operação
    return next(err);
  }
});

  // Definição de rota HTTP
resourcesRouter.patch('/:id', requirePermission('write', 'resource'), (req, res, next) => {
  try {
    const dto = service.updateResource(req.params.id, req.body);
    if (!dto) return res.status(404).json({ message: 'Resource not found' });
    res.json(dto);
  } catch (err: any) {
    if ((err as any)?.issues) return res.status(400).json({ code: 'VALIDATION_ERROR', issues: (err as any).issues });
  // Retorna o resultado da operação
    return next(err);
  }
});

  // Definição de rota HTTP
resourcesRouter.delete('/:id', requirePermission('write', 'resource'), (req, res) => {
  const ok = service.deleteResource(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Resource not found' });
  res.status(204).send();
});