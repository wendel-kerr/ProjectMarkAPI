/**
 * User.ts
 * Interface de usuário e tipo público (sem hash).
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import { Identifiable, Timestamped } from '../common/BaseTypes';
// Importações de dependências e tipos
import { UserRole } from './Role';
// Declarações/exports principais
export interface IUser extends Identifiable, Timestamped { name: string; email: string; role: UserRole; passwordHash: string; }
// Declarações/exports principais
export type PublicUser = Omit<IUser, 'passwordHash'>;