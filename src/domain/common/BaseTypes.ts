export interface Identifiable {
  id: string;
}

export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Minimal base to compose into entities (no inheritance requirements).
 */
export type BaseEntity = Identifiable & Partial<Timestamped>;
