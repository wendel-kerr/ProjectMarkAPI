/**
 * openapi.ts
 * Geração do documento OpenAPI com zod-to-openapi.
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import { z } from 'zod';
// Importações de dependências e tipos
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
// Importações de dependências e tipos
import { createTopicSchema, updateTopicSchema, createResourceSchema, updateResourceSchema, loginSchema } from '../services/Services';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

const TopicDTO = z.object({
  id: z.string().uuid(),
  parentTopicId: z.string().uuid().nullable(),
  name: z.string(),
  content: z.string(),
  version: z.number().int().positive(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).openapi('TopicDTO');

const TopicVersionDTO = z.object({
  topicId: z.string().uuid(),
  version: z.number().int().positive(),
  name: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).openapi('TopicVersionDTO');

const ResourceDTO = z.object({
  id: z.string().uuid(),
  topicId: z.string().uuid(),
  url: z.string().url(),
  description: z.string().optional(),
  type: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).openapi('ResourceDTO');

const PublicUserDTO = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['Admin','Editor','Viewer']),
  createdAt: z.string(),
  updatedAt: z.string(),
}).openapi('PublicUserDTO');

const ErrorSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  issues: z.any().optional(),
}).openapi('Error');

registry.register('TopicDTO', TopicDTO);
registry.register('TopicVersionDTO', TopicVersionDTO);
registry.register('ResourceDTO', ResourceDTO);
registry.register('PublicUserDTO', PublicUserDTO);
registry.register('Error', ErrorSchema);

registry.register('CreateTopic', createTopicSchema.openapi('CreateTopic'));
registry.register('UpdateTopic', updateTopicSchema.openapi('UpdateTopic'));
registry.register('CreateResource', createResourceSchema.openapi('CreateResource'));
registry.register('UpdateResource', updateResourceSchema.openapi('UpdateResource'));
registry.register('Login', loginSchema.openapi('Login'));

registry.registerPath({ method: 'get', path: '/health', summary: 'Healthcheck', responses: { 200: { description: 'OK' } } });

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  summary: 'Login',
  request: { body: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Login' } } }, required: true } },
  responses: { 200: { description: 'OK' }, 401: { description: 'Invalid credentials' } },
});

registry.registerPath({
  method: 'get',
  path: '/auth/me',
  summary: 'Dados do usuário',
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: z.object({ user: PublicUserDTO }) } } } },
});

registry.registerPath({
  method: 'post',
  path: '/topics',
  summary: 'Cria um tópico (root ou filho)',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTopic' } } }, required: true } },
  responses: { 201: { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/TopicDTO' } } } }, 400: { description: 'Erro de validação' }, 409: { description: 'Nome duplicado entre irmãos' } },
});

registry.registerPath({
  method: 'get',
  path: '/topics',
  summary: 'Lista tópicos filhos do parent (ou raízes quando parentId=null)',
  security: [{ bearerAuth: [] }],
  request: { query: z.object({ parentId: z.string().uuid().nullable().optional() }).openapi('ListTopicsQuery') },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/TopicDTO' } } } } } },
});

registry.registerPath({
  method: 'get',
  path: '/topics/{id}',
  summary: 'Obtém um tópico',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }).openapi('GetTopicParams') },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/TopicDTO' } } } }, 404: { description: 'Not found' } },
});

registry.registerPath({
  method: 'patch',
  path: '/topics/{id}',
  summary: 'Atualiza um tópico (gera nova versão)',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }).openapi('UpdateTopicParams'), body: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateTopic' } } }, required: true } },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/TopicDTO' } } } }, 400: { description: 'Erro de validação' }, 404: { description: 'Not found' }, 409: { description: 'Nome duplicado entre irmãos' } },
});

registry.registerPath({
  method: 'delete',
  path: '/topics/{id}',
  summary: 'Soft-delete de tópico',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }).openapi('DeleteTopicParams') },
  responses: { 204: { description: 'No Content' }, 404: { description: 'Not found' } },
});

registry.registerPath({
  method: 'get',
  path: '/topics/{id}/versions',
  summary: 'Lista versões de um tópico',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }).openapi('ListVersionsParams') },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/TopicVersionDTO' } } } } }, 404: { description: 'Not found' } },
});

registry.registerPath({
  method: 'get',
  path: '/topics/{id}/versions/{version}',
  summary: 'Obtém versão específica',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid(), version: z.coerce.number().int().positive() }).openapi('GetSpecificVersionParams') },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/TopicVersionDTO' } } } }, 404: { description: 'Not found' } },
});

registry.registerPath({
  method: 'get',
  path: '/topics/{id}/tree',
  summary: 'Retorna árvore recursiva',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }).openapi('GetTreeParams'),
    query: z.object({ version: z.union([z.literal('latest'), z.coerce.number().int().positive()]).optional(), includeResources: z.coerce.boolean().default(false).optional() }).openapi('GetTreeQuery'),
  },
  responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
});

registry.registerPath({
  method: 'post',
  path: '/resources',
  summary: 'Cria resource',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateResource' } } }, required: true } },
  responses: { 201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ResourceDTO' } } } }, 404: { description: 'Topic not found' } },
});

registry.registerPath({
  method: 'get',
  path: '/resources',
  summary: 'Lista resources por topicId',
  security: [{ bearerAuth: [] }],
  request: { query: z.object({ topicId: z.string().uuid() }).openapi('ListResourcesQuery') },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ResourceDTO' } } } } }, 404: { description: 'Topic not found' } },
});

registry.registerPath({
  method: 'get',
  path: '/resources/{id}',
  summary: 'Obtém resource',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }).openapi('GetResourceParams') },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ResourceDTO' } } } }, 404: { description: 'Not found' } },
});

registry.registerPath({
  method: 'patch',
  path: '/resources/{id}',
  summary: 'Atualiza resource',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }).openapi('PatchResourceParams'), body: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateResource' } } }, required: true } },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ResourceDTO' } } } }, 404: { description: 'Not found' } },
});

registry.registerPath({
  method: 'delete',
  path: '/resources/{id}',
  summary: 'Soft-delete resource',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }).openapi('DeleteResourceParams') },
  responses: { 204: { description: 'No Content' }, 404: { description: 'Not found' } },
});

registry.registerPath({
  method: 'get',
  path: '/topics/shortest-path',
  summary: 'Retorna o menor caminho entre dois tópicos',
  security: [{ bearerAuth: [] }],
  request: { query: z.object({ from: z.string().uuid(), to: z.string().uuid() }).openapi('ShortestPathQuery') },
  responses: {
    200: { description: 'OK', content: { 'application/json': { schema: z.object({ path: z.array(z.object({ id: z.string().uuid(), name: z.string(), version: z.number().int().positive() })) }) } } },
    404: { description: 'Algum tópico não existe' },
    422: { description: 'Não existe caminho entre os tópicos' },
  },
});

// Declarações/exports principais
export function getOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  // Retorna o resultado da operação
  return generator.generateDocument({
    openapi: '3.0.3',
    info: { title: 'Knowledge Base API', version: '1.1.0', description: 'API com Auth (JWT) + RBAC + Shortest Path' },
    servers: [{ url: 'http://localhost:3000' }],
  });
}