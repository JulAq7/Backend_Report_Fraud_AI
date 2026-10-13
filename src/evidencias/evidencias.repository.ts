import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket, } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';

@Injectable()
export class EvidenciasRepository {
  constructor(
    @Inject(DB_POOL)
    private readonly pool: Pool,
  ) {}

  async guardarEvidencia(
    idReporte: number,
    nombreArchivo: string,
    urlArchivo: string,
    tipoArchivo: string,
  ): Promise<number> {
    const [resultado] = await this.pool.execute<ResultSetHeader>(
      `INSERT INTO evidencia
       (id_reporte, nombre_archivo, url_archivo, tipo_archivo)
       VALUES (?, ?, ?, ?)`,
      [idReporte, nombreArchivo, urlArchivo, tipoArchivo],
    );
    
    return resultado.insertId;
  }

async buscarPorNombre(
  nombreArchivo: string,): Promise<RowDataPacket | undefined> {
  const [rows] = await this.pool.execute<RowDataPacket[]>(
    `SELECT
       id_evidencia,
       id_reporte,
       nombre_archivo,
       url_archivo,
       tipo_archivo,
       fecha_carga
     FROM evidencia
     WHERE nombre_archivo = ?
     LIMIT 1`,
    [nombreArchivo],
  );

  return rows[0];
}

}