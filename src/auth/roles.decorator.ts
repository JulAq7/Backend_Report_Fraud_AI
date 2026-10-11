import { SetMetadata } from '@nestjs/common';

// Clave para identificar los roles permitidos
export const ROLES_KEY = 'roles';

export const Roles = (...roles: number[]) =>
  SetMetadata(ROLES_KEY, roles);