/**
 * Services.ts
 * Serviços de domínio (topics, árvore, resources, auth) e schemas Zod.
 * Comentários: este arquivo contém comentários explicativos nas principais seções,
 * descrevendo o que cada bloco faz passo a passo.
 */

// Importações de dependências e tipos
import { z } from 'zod';
// Importações de dependências e tipos
import { TopicRepository } from '../infra/repositories/TopicRepository';
// Importações de dependências e tipos
import { ResourceRepository } from '../infra/repositories/ResourceRepository';
// Importações de dependências e tipos
import { toTopicDTO, TopicDTO, toTopicVersionDTO, TopicVersionDTO, toResourceDTO } from '../infra/mappers/TopicMapper';
// Importações de dependências e tipos
import { UserRepository } from '../infra/repositories/UserRepository';
// Importações de dependências e tipos
import bcrypt from 'bcryptjs';
// Importações de dependências e tipos
import { signJwt } from '../middleware/auth';

// Topic service
// Declarações/exports principais
export const createTopicSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  parentId: z.string().uuid().nullable().optional(),
});

// Declarações/exports principais
export const updateTopicSchema = z.object({
  name: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
}).refine(d => d.name !== undefined || d.content !== undefined, { message: 'At least one field must be provided' });

// Declarações/exports principais
export class TopicService {
  // Construtor injeta dependências necessárias
  constructor(private readonly repo: TopicRepository) {}

  // Método principal da regra de negócio
  createTopic(input: unknown): TopicDTO {
    const { name, content, parentId } = createTopicSchema.parse(input);
    const res = parentId ? this.repo.createChild(parentId, { name, content }) : this.repo.createRoot({ name, content });
  // Retorna o resultado da operação
    return toTopicDTO(res.topic, res.version);
  }

  // Método principal da regra de negócio
  getTopic(id: string): TopicDTO | null {
    const found = this.repo.getById(id);
    if (!found) return null;
  // Retorna o resultado da operação
    return toTopicDTO(found.topic, found.version);
  }

  // Método principal da regra de negócio
  listTopics(parentId: string | null): TopicDTO[] {
    const rows = this.repo.listByParent(parentId);
  // Retorna o resultado da operação
    return rows.map(r => toTopicDTO(r.topic, r.version));
  }

  // Método principal da regra de negócio
  updateTopic(id: string, input: unknown): TopicDTO | null {
    const upd = updateTopicSchema.parse(input);
    const next = this.repo.appendVersion(id, upd);
    if (!next) return null;
    const found = this.repo.getById(id)!;
  // Retorna o resultado da operação
    return toTopicDTO(found.topic, next);
  }

  // Método principal da regra de negócio
  deleteTopic(id: string): boolean { return this.repo.softDelete(id); }

  // Método principal da regra de negócio
  listVersions(id: string): TopicVersionDTO[] | null {
    const arr = this.repo.listVersions(id);
  // Retorna o resultado da operação
    return arr ? arr.map(toTopicVersionDTO) : null;
  }
  // Método principal da regra de negócio
  getVersion(id: string, version: number): TopicVersionDTO | null {
    const v = this.repo.getVersion(id, version);
  // Retorna o resultado da operação
    return v ? toTopicVersionDTO(v) : null;
  }
}

// Tree service
type TreeNode = TopicDTO & { children: TreeNode[]; resources?: ReturnType<typeof toResourceDTO>[] };

// Declarações/exports principais
export class TopicTreeService {
  // Construtor injeta dependências necessárias
  constructor(private readonly topicRepo: TopicRepository, private readonly resourceRepo: ResourceRepository) {}

  // Método principal da regra de negócio
  getTree(id: string, version: number|'latest', includeResources: boolean): TreeNode | null {
    const topicRec = this.topicRepo.getTopicRecord(id);
    if (!topicRec) return null;
    const versionRec = version === 'latest'
      ? this.topicRepo.getVersion(id, topicRec.currentVersion)!
      : this.topicRepo.getVersion(id, version as number);
    if (!versionRec) return null;

    const node: TreeNode = {
      id: topicRec.id,
      parentTopicId: topicRec.parentTopicId,
      name: versionRec.name,
      content: versionRec.content,
      version: versionRec.version,
      createdAt: topicRec.createdAt,
      updatedAt: versionRec.updatedAt,
      children: [],
    };
    if (includeResources) node.resources = (this.resourceRepo.listByTopic(id).map(r => ({ id: r.id, url: r.url, description: r.description ?? '', type: r.type })) as ReturnType<typeof toResourceDTO>[]);

    node.children = this.topicRepo.listChildrenRecords(id).map(c => this.getTree(c.id, 'latest', includeResources)!).filter(Boolean);

  // Retorna o resultado da operação
    return node;
  }
}

// Resource service
// Declarações/exports principais
export const createResourceSchema = z.object({
  topicId: z.string().uuid(),
  url: z.string().url(),
  description: z.string().max(1000).optional(),
  type: z.string().min(1),
});

// Declarações/exports principais
export const updateResourceSchema = z.object({
  url: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  type: z.string().min(1).optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field must be provided' });

// Declarações/exports principais
export class ResourceService {
  // Construtor injeta dependências necessárias
  constructor(private readonly topicRepo: TopicRepository, private readonly resourceRepo: ResourceRepository) {}

  // Método principal da regra de negócio
  createResource(input: unknown) {
    const data = createResourceSchema.parse(input);
    const topic = this.topicRepo.getTopicRecord(data.topicId);
    if (!topic) throw new Error('TopicNotFound');
    const rec = this.resourceRepo.create(data);
  // Retorna o resultado da operação
    return toResourceDTO(rec);
  }

  // Método principal da regra de negócio
  getResource(id: string) {
    const rec = this.resourceRepo.getById(id);
  // Retorna o resultado da operação
    return rec ? toResourceDTO(rec) : null;
  }

  // Método principal da regra de negócio
  listByTopic(topicId: string) {
    const topic = this.topicRepo.getTopicRecord(topicId);
    if (!topic) throw new Error('TopicNotFound');
  // Retorna o resultado da operação
    return this.resourceRepo.listByTopic(topicId).map(toResourceDTO);
  }

  // Método principal da regra de negócio
  updateResource(id: string, input: unknown) {
    const upd = updateResourceSchema.parse(input);
    const rec = this.resourceRepo.update(id, upd);
  // Retorna o resultado da operação
    return rec ? toResourceDTO(rec) : null;
  }

  // Método principal da regra de negócio
  deleteResource(id: string) { return this.resourceRepo.softDelete(id); }
}

// Auth service
const emailStrict = z.string().trim().transform(v => v.toLowerCase()).pipe(z.string().email());
// Declarações/exports principais
export const loginSchema = z.object({ email: emailStrict, password: z.string().min(3) });
// Declarações/exports principais
export type LoginInput = z.infer<typeof loginSchema>;

// Declarações/exports principais
export class AuthService {
  // Construtor injeta dependências necessárias
  constructor(private readonly userRepo: UserRepository) {}

  async login(input: unknown) {
    const { email, password }: LoginInput = loginSchema.parse(input);
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error('INVALID_CREDENTIALS');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error('INVALID_CREDENTIALS');
    const token = signJwt({ id: user.id, name: user.name, email: user.email, role: user.role as any });
  // Retorna o resultado da operação
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt } };
  }

  async seedDefaultsIfEmpty() {
    if ((await this.userRepo.count()) > 0) return;
    const hash = (pwd: string) => bcrypt.hashSync(pwd, 8);
    await this.userRepo.create({ name: 'Admin', email: 'admin@example.com', role: 'Admin', passwordHash: hash('password') });
    await this.userRepo.create({ name: 'Editor', email: 'editor@example.com', role: 'Editor', passwordHash: hash('password') });
    await this.userRepo.create({ name: 'Viewer', email: 'viewer@example.com', role: 'Viewer', passwordHash: hash('password') });
  }
}