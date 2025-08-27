export interface Identifiable{ id:string } export interface Timestamped{ createdAt:Date; updatedAt:Date } export type BaseEntity=Identifiable & Partial<Timestamped>;
