/**
 * Resource.ts
 * Interface de resource associado ao tópico.
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import { Identifiable, Timestamped } from '../common/BaseTypes';
// Declarações/exports principais
export type ResourceType = 'video'|'article'|'pdf'|'link'|string;
// Declarações/exports principais
export interface IResource extends Identifiable, Timestamped { topicId: string; url: string; description?: string; type: ResourceType; }