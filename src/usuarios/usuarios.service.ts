
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UsuariosRepository } from './usuarios.repository';
import type { ActualizacionPerfil } from './usuarios.repository';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly repository: UsuariosRepository,
  ) {}

  /**
   * Obtiene el perfil del usuario autenticado.
   */
  async obtenerPerfil(idUsuario: number) {
    const usuario = await this.repository.findById(idUsuario);

    if (!usuario) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    return usuario;
  }

  /**
   * Actualiza los datos del perfil del usuario autenticado.
   */
  async actualizarPerfil(
    idUsuario: number,
    cambios: ActualizacionPerfil,
  ) {
    await this.obtenerPerfil(idUsuario);

    try {
      await this.repository.actualizar(idUsuario, cambios);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException(
          'El nombre de usuario ya está en uso',
        );
      }

      throw error;
    }

    return this.obtenerPerfil(idUsuario);
  }
}
