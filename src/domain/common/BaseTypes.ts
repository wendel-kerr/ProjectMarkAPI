/**
 * BaseTypes.ts
 * Tipos base para entidades (Identifiable, Timestamped).
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Declarações/exports principais
export interface Identifiable{ id:string } export interface Timestamped{ createdAt:Date; updatedAt:Date } export type BaseEntity=Identifiable & Partial<Timestamped>;