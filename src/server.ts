import { env } from './config/env';
/**
 * server.ts
 * Sobe o servidor HTTP na porta configurada.
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import app from './app';
const port = env.PORT;
app.listen(port, () => console.log(`KB API on http://localhost:${env.PORT}`));