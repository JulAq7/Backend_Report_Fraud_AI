import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { User } from './entities/user.entity';

const COLUMNS = `
  id_usuario,
  nombre_usuario,
  correo_electronico,
  contrasena_hash,
  fecha_creacion,
  id_rol
`;

@Injectable()
export class UsersRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async findByEmail(correoElectronico: string): Promise<User | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS}
       FROM usuario
       WHERE correo_electronico = '${correoElectronico}'`,
    );

    return rows[0] && toEntity(rows[0]);
  }

  async save(
    nombreUsuario: string,
    correoElectronico: string,
    contrasenaHash: string,
    idRol: number = 1,
  ): Promise<User> {
    await this.pool.query(
      `INSERT INTO usuario (
        nombre_usuario,
        correo_electronico,
        contrasena_hash,
        id_rol
      )
      VALUES (
        '${nombreUsuario}',
        '${correoElectronico}',
        '${contrasenaHash}',
        '${idRol}'
      )`,
    );

    return (await this.findByEmail(correoElectronico))!;
  }
}

function toEntity(row: any): User {
  const user = new User();

  user.idUsuario = row.id_usuario;
  user.nombreUsuario = row.nombre_usuario;
  user.correoElectronico = row.correo_electronico;
  user.contrasenaHash = row.contrasena_hash;
  user.fechaCreacion = row.fecha_creacion;
  user.idRol = row.id_rol;

  return user;
}