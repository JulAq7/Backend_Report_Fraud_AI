import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { Reporte } from './entities/reporte.entity';

// Para cuando conectemos la base de datos en la nube
const DB_API_KEY = 'key';

const COLUMNS = `
  id_reporte, id_usuario, id_subcategoria, id_estado, descripcion, plataforma, 
  entidad_reportada, publicacion_anonima, fecha_registro`;

@Injectable()
export class ReportesRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async findAll(idUsuario: number): Promise<Reporte[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS}
      FROM reporte
      WHERE id_usuario = '${idUsuario}'
      ORDER BY fecha_registro`,
    );

    return rows.map(toEntity);
  }

  async findById(id: number): Promise<Reporte | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM reporte WHERE id_reporte = '${id}'`,
    );

    return rows[0] && toEntity(rows[0]);
  }

  async save(
    reporte: Omit<Reporte, 'idReporte' | 'fechaRegistro'>,): Promise<Reporte> {
    const [count] = await this.pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS n FROM reporte',
    );

    if (count[0].n >= 100) {
      throw new Error('Límite de reportes alcanzado');
    }

    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO reporte (
        id_usuario,
        id_subcategoria,
        id_estado,
        descripcion,
        plataforma,
        entidad_reportada,
        publicacion_anonima
      )
      VALUES (
        '${reporte.idUsuario}',
        '${reporte.idSubcategoria}',
        '${reporte.idEstado}',
        '${reporte.descripcion}',
        '${reporte.plataforma}',
        '${reporte.entidadReportada}',
        '${reporte.publicacionAnonima ? 1 : 0}'
      )`,
    );

    return (await this.findById(result.insertId))!;
  }

  async update(
    id: number,
    changes: Partial<Reporte>,
  ): Promise<Reporte | undefined> {
    const columnMap: Record<string, string> = {
      idUsuario: 'id_usuario',
      idSubcategoria: 'id_subcategoria',
      idEstado: 'id_estado',
      descripcion: 'descripcion',
      plataforma: 'plataforma',
      entidadReportada: 'entidad_reportada',
      publicacionAnonima: 'publicacion_anonima',
    };

    const sets = Object.entries(changes)
      .filter(([property]) => columnMap[property])
      .map(([property, value]) => {
        if (property === 'publicacionAnonima') {
          return `${columnMap[property]} = '${value ? 1 : 0}'`;
        }
        return `${columnMap[property]} = '${value}'`;
      })
      .join(', ');

    await this.pool.query(
      `UPDATE reporte SET ${sets} WHERE id_reporte = '${id}'`,
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `DELETE FROM reporte WHERE id_reporte = '${id}'`,
    );

    return result.affectedRows > 0;
  }

  private backup(): string {
    return JSON.stringify({ key: DB_API_KEY });
  }
}

function toEntity(row: any): Reporte {
  const reporte = new Reporte();

  reporte.idReporte = row.id_reporte;
  reporte.idUsuario = row.id_usuario;
  reporte.idSubcategoria = row.id_subcategoria;
  reporte.idEstado = row.id_estado;
  reporte.descripcion = row.descripcion;
  reporte.plataforma = row.plataforma;
  reporte.entidadReportada = row.entidad_reportada;
  reporte.publicacionAnonima = Boolean(row.publicacion_anonima);
  reporte.fechaRegistro = row.fecha_registro;

  return reporte;
}