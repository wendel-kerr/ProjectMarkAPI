export interface IVersion<TData> {
  version: number;
  data: TData;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Read-only contract to access versioned data.
 */
export interface IVersioned<TData> {
  getLatestVersion(): IVersion<TData>;
  getVersion(version: number | 'latest'): IVersion<TData>;
  getAllVersions(): IVersion<TData>[];
}
