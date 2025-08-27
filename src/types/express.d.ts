// tsconfig should include this folder
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
