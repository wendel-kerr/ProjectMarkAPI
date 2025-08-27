import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { getOpenApiDocument } from '../schemas/openapi';

export const docsRouter = Router();

const openapiDoc = getOpenApiDocument();

docsRouter.get('/openapi.json', (_req, res) => { res.json(openapiDoc); });
docsRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));
