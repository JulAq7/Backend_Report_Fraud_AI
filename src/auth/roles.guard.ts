import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener los roles permitidos para el endpoint
    const rolesPermitidos = this.reflector.getAllAndOverride<number[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no se especificaron rolees
    if (!rolesPermitidos || rolesPermitidos.length === 0) {
      return true;
    }

    // Obtener el usuario autenticado
    const request = context.switchToHttp().getRequest();
    const usuario = request.user;

    // Comprobar que el usuario tenga un rol válido
    if (!usuario || typeof usuario.idRol !== 'number') {
      throw new ForbiddenException(
        'No se pudo verificar el rol del usuario',
      );
    }

    // Comprobar si su rol está permitido
    if (!rolesPermitidos.includes(usuario.idRol)) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a esta función',
      );
    }

    return true;
  }
}