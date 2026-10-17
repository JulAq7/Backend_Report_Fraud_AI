
import { Inject, Injectable } from '@nestjs/common';

import type { Pool, RowDataPacket } from 'mysql2/promise';
  
import { DB_POOL } from '../database/database.module';

type CategoriaRow = RowDataPacket & {
  idCategoria: number;
  nombreCategoria: string;
  descripcion: string | null;
};

type SubcategoriaRow = RowDataPacket & {
  idSubcategoria: number;
  idCategoria: number;
  nombreSubcategoria: string;
  descripcion: string | null;
};

@Injectable()
export class CategoriasRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<CategoriaRow[]> {
    const [rows] = await this.pool.execute<CategoriaRow[]>(
      `SELECT id_categoria AS idCategoria,
              nombre_categoria AS nombreCategoria,
              descripcion
       FROM categoria_reporte
       ORDER BY id_categoria ASC`,
    );

    return rows;
  }

  async findSubcategorias(): Promise<SubcategoriaRow[]> {
    const [rows] = await this.pool.execute<SubcategoriaRow[]>(
      `SELECT id_subcategoria AS idSubcategoria,
              id_categoria AS idCategoria,
              nombre_subcategoria AS nombreSubcategoria,
              descripcion
       FROM subcategoria_reporte
       ORDER BY id_categoria ASC, id_subcategoria ASC`,
    );

    return rows;
  }

  async findCategoriaById(
    idCategoria: number,
  ): Promise<CategoriaRow | null> {
    const [rows] = await this.pool.execute<CategoriaRow[]>(
      `SELECT id_categoria AS idCategoria,
              nombre_categoria AS nombreCategoria,
              descripcion
       FROM categoria_reporte
       WHERE id_categoria = ?`,
      [idCategoria],
    );

    return rows[0] ?? null;
  }

  async findSubcategoriasByCategoria(
    idCategoria: number,
  ): Promise<SubcategoriaRow[]> {
    const [rows] = await this.pool.execute<SubcategoriaRow[]>(
      `SELECT id_subcategoria AS idSubcategoria,
              id_categoria AS idCategoria,
              nombre_subcategoria AS nombreSubcategoria,
              descripcion
       FROM subcategoria_reporte
       WHERE id_categoria = ?
       ORDER BY id_subcategoria ASC`,
      [idCategoria],
    );

    return rows;
  }
}
