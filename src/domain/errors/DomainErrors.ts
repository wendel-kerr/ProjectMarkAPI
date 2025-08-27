export class DomainError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class VersionNotFoundError extends DomainError {
  constructor(version: number) {
    super('VERSION_NOT_FOUND', `Version ${version} not found`);
  }
}

export class DuplicateSiblingNameError extends DomainError {
  constructor(name: string) {
    super('DUPLICATE_SIBLING_NAME', `Sibling with name "${name}" already exists`);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(action: string, entity: string) {
    super('UNAUTHORIZED', `Not allowed to ${action} ${entity}`);
  }
}
