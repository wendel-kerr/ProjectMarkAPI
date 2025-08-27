/**
 * topics.ts
 * Rotas de tópicos: CRUD, versões, árvore e menor caminho.
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
import { TopicService, TopicTreeService } from '../services/Services';
// Importações de dependências e tipos
import { authGuard, requirePermission } from '../middleware/auth';
// Importações de dependências e tipos
import { z } from 'zod';
// Importações de dependências e tipos
import { TopicGraphService } from '../services/TopicGraphService';

const topicRepo = new TopicRepository();
const resourceRepo = new ResourceRepository();
const service = new TopicService(topicRepo);
const treeService = new TopicTreeService(topicRepo, resourceRepo);
const graphService = new TopicGraphService(topicRepo);

// Declarações/exports principais
export const topicsRouter = Router();

// All topics routes require auth token
  // Definição de rota HTTP
topicsRouter.use(authGuard);

// ---- Shortest Path FIRST to avoid /:id capturing it ----
  // Definição de rota HTTP
topicsRouter.get('/shortest-path', requirePermission('read', 'topic'), (req, res) => {
  const schema = z.object({ from: z.string().uuid(), to: z.string().uuid() });
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ code: 'VALIDATION_ERROR', issues: parsed.error.issues });
  try {
    const { from, to } = parsed.data;
    const path = graphService.shortestPath(from, to);
    res.json({ path });
  } catch (err: any) {
    if (err?.message === 'TopicNotFound') return res.status(404).json({ code: 'TOPIC_NOT_FOUND' });
    if (err?.message === 'NoPath') return res.status(422).json({ code: 'NO_PATH' });
    res.status(500).json({ code: 'INTERNAL_ERROR' });
  }
});

// Create
  // Definição de rota HTTP
topicsRouter.post('/', requirePermission('write', 'topic'), (req, res, next) => {
  try {
    const dto = service.createTopic(req.body);
    res.status(201).json(dto);
  } catch (err: any) {
    if (typeof err.message === 'string' && err.message.startsWith('DuplicateSiblingName:')) {
  // Retorna o resultado da operação
      return res.status(409).json({ code: 'DUPLICATE_SIBLING_NAME', message: err.message });
    }
    if ((err as any)?.issues) return res.status(400).json({ code: 'VALIDATION_ERROR', issues: (err as any).issues });
  // Retorna o resultado da operação
    return next(err);
  }
});

// List
  // Definição de rota HTTP
topicsRouter.get('/', requirePermission('read', 'topic'), (req, res) => {
  const parentIdRaw = req.query.parentId as string | undefined;
  const parentId = parentIdRaw === undefined ? null : (parentIdRaw === 'null' ? null : parentIdRaw);
  const list = service.listTopics(parentId);
  res.json(list);
});

// Get by id
  // Definição de rota HTTP
topicsRouter.get('/:id', requirePermission('read', 'topic'), (req, res) => {
  const dto = service.getTopic(req.params.id);
  if (!dto) return res.status(404).json({ message: 'Topic not found' });
  res.json(dto);
});

// Update
  // Definição de rota HTTP
topicsRouter.patch('/:id', requirePermission('write', 'topic'), (req, res, next) => {
  try {
    const dto = service.updateTopic(req.params.id, req.body);
    if (!dto) return res.status(404).json({ message: 'Topic not found' });
    res.json(dto);
  } catch (err: any) {
    if (typeof err.message === 'string' && err.message.startsWith('DuplicateSiblingName:')) {
  // Retorna o resultado da operação
      return res.status(409).json({ code: 'DUPLICATE_SIBLING_NAME', message: err.message });
    }
    if ((err as any)?.issues) return res.status(400).json({ code: 'VALIDATION_ERROR', issues: (err as any).issues });
  // Retorna o resultado da operação
    return next(err);
  }
});

// Delete
  // Definição de rota HTTP
topicsRouter.delete('/:id', requirePermission('write', 'topic'), (req, res) => {
  const ok = service.deleteTopic(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Topic not found' });
  res.status(204).send();
});

// Versions
  // Definição de rota HTTP
topicsRouter.get('/:id/versions', requirePermission('read', 'topic'), (req, res) => {
  const list = service.listVersions(req.params.id);
  if (!list) return res.status(404).json({ message: 'Topic not found' });
  res.json(list);
});
  // Definição de rota HTTP
topicsRouter.get('/:id/versions/:version', requirePermission('read', 'topic'), (req, res) => {
  const versionNum = Number(req.params.version);
  if (!Number.isInteger(versionNum) || versionNum <= 0) return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'version must be a positive integer' });
  const item = service.getVersion(req.params.id, versionNum);
  if (!item) return res.status(404).json({ message: 'Version not found' });
  res.json(item);
});

// Tree
  // Definição de rota HTTP
topicsRouter.get('/:id/tree', requirePermission('read', 'topic'), (req, res) => {
  const vParam = (req.query.version as string) ?? 'latest';
  const includeResources = ((req.query.includeResources as string) ?? 'false').toLowerCase() === 'true';
  const version = vParam === 'latest' ? 'latest' : Number(vParam);
  if (version !== 'latest' && (!Number.isInteger(version) || version <= 0)) {
  // Retorna o resultado da operação
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'version must be "latest" or a positive integer' });
  }
  const tree = treeService.getTree(req.params.id, version as any, includeResources);
  if (!tree) return res.status(404).json({ message: 'Topic not found' });
  res.json(tree);
});