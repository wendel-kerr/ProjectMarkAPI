/**
 * docs.ts
 * Exposição do OpenAPI/Swagger.
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import { Router } from 'express';
// Importações de dependências e tipos
import swaggerUi from 'swagger-ui-express';
// Importações de dependências e tipos
import { getOpenApiDocument } from '../schemas/openapi';

// Declarações/exports principais
export const docsRouter = Router();

const openapiDoc = getOpenApiDocument();

  // Definição de rota HTTP
docsRouter.get('/openapi.json', (_req, res) => { res.json(openapiDoc); });
  // Definição de rota HTTP
docsRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));