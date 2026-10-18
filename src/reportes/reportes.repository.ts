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

  async findPendientes(): Promise<
    {
      reporte: Reporte;
      categoria: string;
      subcategoria: string;
    }[]
  > {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT
        r.id_reporte,
        r.id_usuario,
        r.id_subcategoria,
        r.id_estado,
        r.descripcion,
        r.plataforma,
        r.entidad_reportada,
        r.publicacion_anonima,
        r.fecha_registro,
        c.nombre_categoria,
        s.nombre_subcategoria
      FROM reporte r
      INNER JOIN subcategoria_reporte s
        ON r.id_subcategoria = s.id_subcategoria
      INNER JOIN categoria_reporte c
        ON s.id_categoria = c.id_categoria
      WHERE r.id_estado = 1
      ORDER BY r.fecha_registro DESC`,
    );

    return rows.map((row) => ({
      reporte: toEntity(row),
      categoria: String(row.nombre_categoria),
      subcategoria: String(row.nombre_subcategoria),
    }));
  }

  async findHistorial(): Promise<
    {
      reporte: Reporte;
      categoria: string;
      subcategoria: string;
    }[]
  > {
    const [rows]: any = await this.pool.query(`
      SELECT
        r.id_reporte,
        r.id_usuario,
        r.id_subcategoria,
        r.id_estado,
        r.descripcion,
        r.plataforma,
        r.entidad_reportada,
        r.publicacion_anonima,
        r.fecha_registro,
        c.nombre_categoria,
        s.nombre_subcategoria
      FROM reporte r
      INNER JOIN subcategoria_reporte s
        ON r.id_subcategoria = s.id_subcategoria
      INNER JOIN categoria_reporte c
        ON s.id_categoria = c.id_categoria
      WHERE r.id_estado IN (2, 3)
      ORDER BY r.fecha_registro DESC
    `);

    return rows.map((row: any) => ({
      reporte: {
        idReporte: row.id_reporte,
        idUsuario: row.id_usuario,
        idSubcategoria: row.id_subcategoria,
        idEstado: row.id_estado,
        descripcion: row.descripcion,
        plataforma: row.plataforma,
        entidadReportada: row.entidad_reportada,
        publicacionAnonima: Boolean(
          row.publicacion_anonima,
        ),
        fechaRegistro: row.fecha_registro,
      },
      categoria: row.nombre_categoria,
      subcategoria: row.nombre_subcategoria,
    }));
  }


  
  /**
   * Consulta los reportes públicos aprobados.
   * Permite filtrar los resultados mediante un término de búsqueda.
   */
  async findPublicos(buscar: string = '') {
    const patron = `%${buscar}%`;

    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT
        r.id_reporte,
        r.id_subcategoria,
        r.id_estado,
        r.descripcion,
        r.plataforma,
        r.entidad_reportada,
        r.publicacion_anonima,
        r.fecha_registro,
        c.nombre_categoria,
        s.nombre_subcategoria
      FROM reporte r
      INNER JOIN subcategoria_reporte s
        ON r.id_subcategoria = s.id_subcategoria
      INNER JOIN categoria_reporte c
        ON s.id_categoria = c.id_categoria
      WHERE r.id_estado = 2
        AND (
          r.descripcion LIKE ?
          OR r.plataforma LIKE ?
          OR r.entidad_reportada LIKE ?
          OR c.nombre_categoria LIKE ?
          OR s.nombre_subcategoria LIKE ?
        )
      ORDER BY r.fecha_registro DESC`,
      [patron, patron, patron, patron, patron],
    );

    return rows.map((row) => ({
      idReporte: Number(row.id_reporte),
      idSubcategoria: Number(row.id_subcategoria),
      idEstado: Number(row.id_estado),
      descripcion: String(row.descripcion),
      plataforma: String(row.plataforma),
      entidadReportada: String(row.entidad_reportada),
      publicacionAnonima: Boolean(row.publicacion_anonima),
      fechaRegistro: row.fecha_registro,
      categoria: String(row.nombre_categoria),
      subcategoria: String(row.nombre_subcategoria),
    }));
  }


  async findDetalleById(
    id: number,
  ): Promise<
    | {
        reporte: Reporte;
        categoria: string;
        subcategoria: string;
      }
    | undefined
  > {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT
        r.id_reporte,
        r.id_usuario,
        r.id_subcategoria,
        r.id_estado,
        r.descripcion,
        r.plataforma,
        r.entidad_reportada,
        r.publicacion_anonima,
        r.fecha_registro,
        c.nombre_categoria,
        s.nombre_subcategoria
      FROM reporte r
      INNER JOIN subcategoria_reporte s
        ON r.id_subcategoria = s.id_subcategoria
      INNER JOIN categoria_reporte c
        ON s.id_categoria = c.id_categoria
      WHERE r.id_reporte = ?
      LIMIT 1`,
      [id],
    );

    if (!rows[0]) {
      return undefined;
    }

    return {
      reporte: toEntity(rows[0]),
      categoria: String(rows[0].nombre_categoria),
      subcategoria: String(rows[0].nombre_subcategoria),
    };
  }

  async getResumen(): Promise<{
    total: number;
    pendientes: number;
    aprobados: number;
    rechazados: number;
  }> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT
        COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN id_estado = 1 THEN 1 ELSE 0 END), 0) AS pendientes,
        COALESCE(SUM(CASE WHEN id_estado = 2 THEN 1 ELSE 0 END), 0) AS aprobados,
        COALESCE(SUM(CASE WHEN id_estado = 3 THEN 1 ELSE 0 END), 0) AS rechazados
      FROM reporte`,
    );

    const resumen = rows[0];

    return {
      total: Number(resumen.total),
      pendientes: Number(resumen.pendientes),
      aprobados: Number(resumen.aprobados),
      rechazados: Number(resumen.rechazados),
    };
  }

  async getEstadisticas(): Promise<{
    porSexo: { sexo: string; cantidad: number }[];
    porRangoEdad: { rango: string; cantidad: number }[];
    porPlataforma: { plataforma: string; cantidad: number }[];
  }> {
    const [sexoRows] =
      await this.pool.query<RowDataPacket[]>(
        `SELECT
          COALESCE(NULLIF(u.sexo, ''), 'No especificado') AS sexo,
          COUNT(*) AS cantidad
        FROM reporte r
        INNER JOIN usuario u
          ON r.id_usuario = u.id_usuario
        GROUP BY sexo
        ORDER BY cantidad DESC`,
      );

    const [edadRows] =
      await this.pool.query<RowDataPacket[]>(
        `SELECT
          CASE
            WHEN u.fecha_nacimiento IS NULL
              THEN 'No especificado'
            WHEN TIMESTAMPDIFF(
              YEAR,
              u.fecha_nacimiento,
              CURDATE()
            ) < 18
              THEN 'Menor de 18'
            WHEN TIMESTAMPDIFF(
              YEAR,
              u.fecha_nacimiento,
              CURDATE()
            ) BETWEEN 18 AND 29
              THEN '18-29'
            WHEN TIMESTAMPDIFF(
              YEAR,
              u.fecha_nacimiento,
              CURDATE()
            ) BETWEEN 30 AND 44
              THEN '30-44'
            WHEN TIMESTAMPDIFF(
              YEAR,
              u.fecha_nacimiento,
              CURDATE()
            ) BETWEEN 45 AND 59
              THEN '45-59'
            ELSE '60+'
          END AS rango,
          COUNT(*) AS cantidad
        FROM reporte r
        INNER JOIN usuario u
          ON r.id_usuario = u.id_usuario
        GROUP BY rango
        ORDER BY cantidad DESC`,
      );

    const [plataformaRows] =
      await this.pool.query<RowDataPacket[]>(
        `SELECT
          COALESCE(
            NULLIF(plataforma, ''),
            'No especificado'
          ) AS plataforma,
          COUNT(*) AS cantidad
        FROM reporte
        GROUP BY plataforma
        ORDER BY cantidad DESC`,
      );

    return {
      porSexo: sexoRows.map((row) => ({
        sexo: String(row.sexo),
        cantidad: Number(row.cantidad),
      })),

      porRangoEdad: edadRows.map((row) => ({
        rango: String(row.rango),
        cantidad: Number(row.cantidad),
      })),

      porPlataforma: plataformaRows.map((row) => ({
        plataforma: String(row.plataforma),
        cantidad: Number(row.cantidad),
      })),
    };
  }

  async findById(id: number): Promise<Reporte | undefined> {
  const [rows] = await this.pool.execute<RowDataPacket[]>(
    `SELECT ${COLUMNS} FROM reporte WHERE id_reporte = ?`,
    [id],
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



  async updateEstado(
    id: number,
    idEstado: number,
  ): Promise<Reporte | undefined> {
    await this.pool.query(
      `UPDATE reporte
      SET id_estado = '${idEstado}'
      WHERE id_reporte = '${id}'`,
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