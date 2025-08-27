import { z } from 'zod';
import { TopicRepository } from '../infra/repositories/TopicRepository';
import { ResourceRepository } from '../infra/repositories/ResourceRepository';
import { toTopicDTO, TopicDTO, toTopicVersionDTO, TopicVersionDTO, toResourceDTO } from '../infra/mappers/TopicMapper';
import { UserRepository } from '../infra/repositories/UserRepository';
import bcrypt from 'bcryptjs';
import { signJwt } from '../middleware/auth';

// Topic service
export const createTopicSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  parentId: z.string().uuid().nullable().optional(),
});

export const updateTopicSchema = z.object({
  name: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
}).refine(d => d.name !== undefined || d.content !== undefined, { message: 'At least one field must be provided' });

export class TopicService {
  constructor(private readonly repo: TopicRepository) {}

  createTopic(input: unknown): TopicDTO {
    const { name, content, parentId } = createTopicSchema.parse(input);
    const res = parentId ? this.repo.createChild(parentId, { name, content }) : this.repo.createRoot({ name, content });
    return toTopicDTO(res.topic, res.version);
  }

  getTopic(id: string): TopicDTO | null {
    const found = this.repo.getById(id);
    if (!found) return null;
    return toTopicDTO(found.topic, found.version);
  }

  listTopics(parentId: string | null): TopicDTO[] {
    const rows = this.repo.listByParent(parentId);
    return rows.map(r => toTopicDTO(r.topic, r.version));
  }

  updateTopic(id: string, input: unknown): TopicDTO | null {
    const upd = updateTopicSchema.parse(input);
    const next = this.repo.appendVersion(id, upd);
    if (!next) return null;
    const found = this.repo.getById(id)!;
    return toTopicDTO(found.topic, next);
  }

  deleteTopic(id: string): boolean { return this.repo.softDelete(id); }

  listVersions(id: string): TopicVersionDTO[] | null {
    const arr = this.repo.listVersions(id);
    return arr ? arr.map(toTopicVersionDTO) : null;
  }
  getVersion(id: string, version: number): TopicVersionDTO | null {
    const v = this.repo.getVersion(id, version);
    return v ? toTopicVersionDTO(v) : null;
  }
}

// Tree service
type TreeNode = TopicDTO & { children: TreeNode[]; resources?: ReturnType<typeof toResourceDTO>[] };

export class TopicTreeService {
  constructor(private readonly topicRepo: TopicRepository, private readonly resourceRepo: ResourceRepository) {}

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
    if (includeResources) node.resources = this.resourceRepo.listByTopic(id).map(toResourceDTO);

    node.children = this.topicRepo.listChildrenRecords(id).map(c => this.getTree(c.id, 'latest', includeResources)!).filter(Boolean);

    return node;
  }
}

// Resource service
export const createResourceSchema = z.object({
  topicId: z.string().uuid(),
  url: z.string().url(),
  description: z.string().max(1000).optional(),
  type: z.string().min(1),
});

export const updateResourceSchema = z.object({
  url: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  type: z.string().min(1).optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field must be provided' });

export class ResourceService {
  constructor(private readonly topicRepo: TopicRepository, private readonly resourceRepo: ResourceRepository) {}

  createResource(input: unknown) {
    const data = createResourceSchema.parse(input);
    const topic = this.topicRepo.getTopicRecord(data.topicId);
    if (!topic) throw new Error('TopicNotFound');
    const rec = this.resourceRepo.create(data);
    return toResourceDTO(rec);
  }

  getResource(id: string) {
    const rec = this.resourceRepo.getById(id);
    return rec ? toResourceDTO(rec) : null;
  }

  listByTopic(topicId: string) {
    const topic = this.topicRepo.getTopicRecord(topicId);
    if (!topic) throw new Error('TopicNotFound');
    return this.resourceRepo.listByTopic(topicId).map(toResourceDTO);
  }

  updateResource(id: string, input: unknown) {
    const upd = updateResourceSchema.parse(input);
    const rec = this.resourceRepo.update(id, upd);
    return rec ? toResourceDTO(rec) : null;
  }

  deleteResource(id: string) { return this.resourceRepo.softDelete(id); }
}

// Auth service
const emailStrict = z.string().email().trim().transform(v => v.toLowerCase());
export const loginSchema = z.object({ email: emailStrict, password: z.string().min(3) });
export type LoginInput = z.infer<typeof loginSchema>;

export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async login(input: unknown) {
    const { email, password }: LoginInput = loginSchema.parse(input);
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error('INVALID_CREDENTIALS');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error('INVALID_CREDENTIALS');
    const token = signJwt({ id: user.id, name: user.name, email: user.email, role: user.role as any });
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
