export interface IVersion<TData> { version: number; data: TData; createdAt: Date; updatedAt: Date; }
export interface IVersioned<TData> {
  getLatestVersion(): IVersion<TData>;
  getVersion(version: number|'latest'): IVersion<TData>;
  getAllVersions(): IVersion<TData>[];
}
