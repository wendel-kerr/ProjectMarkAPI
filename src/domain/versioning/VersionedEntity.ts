import { IVersion, IVersioned } from './IVersion';
import { VersionNotFoundError } from '../errors/DomainErrors';
export abstract class VersionedEntity<TData> implements IVersioned<TData> {
  protected versions: IVersion<TData>[] = [];
  protected currentVersion = 0;
  protected createInitialVersion(data: TData): IVersion<TData> {
    const now = new Date();
    const v: IVersion<TData> = { version: 1, data: Object.freeze({ ...data }), createdAt: now, updatedAt: now };
    this.versions.push(v); this.currentVersion = 1; return v;
  }
  protected createNewVersion(update: Partial<TData>): IVersion<TData> {
    const prev = this.getLatestVersion(); const now = new Date(); const nextVersionNumber = prev.version + 1;
    const next: IVersion<TData> = { version: nextVersionNumber, data: Object.freeze({ ...(prev.data as any), ...(update as any) }), createdAt: prev.createdAt, updatedAt: now };
    this.versions.push(next); this.currentVersion = nextVersionNumber; return next;
  }
  public getLatestVersion(): IVersion<TData> { if (this.versions.length===0) throw new VersionNotFoundError(1); return this.versions[this.versions.length-1]; }
  public getVersion(version: number|'latest'): IVersion<TData> { if (version==='latest') return this.getLatestVersion(); const found = this.versions.find(v => v.version===version); if(!found) throw new VersionNotFoundError(version); return found; }
  public getAllVersions(): IVersion<TData>[] { return [...this.versions]; }
}
