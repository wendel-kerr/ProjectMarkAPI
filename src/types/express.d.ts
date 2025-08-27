// augment Express Request.user
import 'express-serve-static-core';
import { UserRole } from '../domain/users/Role';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
    };
  }
}
