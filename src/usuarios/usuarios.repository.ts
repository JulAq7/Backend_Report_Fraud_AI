
import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';

export interface PerfilUsuario extends RowDataPacket {
  idUsuario: number;
  nombreUsuario: string;
  correoElectronico: string;
  sexo: string | null;
  fechaNacimiento: string | null;
  fechaCreacion: Date;
  idRol: number;
}

export interface ActualizacionPerfil {
  nombreUsuario?: string;
  sexo?: string | null;
  fechaNacimiento?: string | null;
}

@Injectable()
export class UsuariosRepository {
  constructor(
    @Inject(DB_POOL) private readonly pool: Pool,
  ) {}

  async findById(
    idUsuario: number,
  ): Promise<PerfilUsuario | null> {
    const [rows] = await this.pool.execute<PerfilUsuario[]>(
      `SELECT
        id_usuario AS idUsuario,
        nombre_usuario AS nombreUsuario,
        correo_electronico AS correoElectronico,
        sexo,
        DATE_FORMAT(fecha_nacimiento, '%Y-%m-%d') AS fechaNacimiento,
        fecha_creacion AS fechaCreacion,
        id_rol AS idRol
      FROM usuario
      WHERE id_usuario = ?
      LIMIT 1`,
      [idUsuario],
    );

    return rows[0] ?? null;
  }

  async actualizar(
    idUsuario: number,
    cambios: ActualizacionPerfil,
  ): Promise<void> {
    const campos: string[] = [];
    const valores: (string | number | null)[] = [];

    if (cambios.nombreUsuario !== undefined) {
      campos.push('nombre_usuario = ?');
      valores.push(cambios.nombreUsuario);
    }

    if (cambios.sexo !== undefined) {
      campos.push('sexo = ?');
      valores.push(cambios.sexo);
    }

    if (cambios.fechaNacimiento !== undefined) {
      campos.push('fecha_nacimiento = ?');
      valores.push(cambios.fechaNacimiento);
    }

    if (campos.length === 0) {
      return;
    }

    valores.push(idUsuario);

    await this.pool.execute(
      `UPDATE usuario
       SET ${campos.join(', ')}
       WHERE id_usuario = ?`,
      valores,
    );
  }
}
