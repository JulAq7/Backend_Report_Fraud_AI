
import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriasRepository } from './categorias.repository';

@Injectable()
export class CategoriasService {
  constructor(
    private readonly categoriasRepository: CategoriasRepository,
  ) {}

  async obtenerCategorias() {
    return this.categoriasRepository.findAll();
  }

  async obtenerSubcategorias() {
    return this.categoriasRepository.findSubcategorias();
  }

  async obtenerCategoriaPorId(idCategoria: number) {
    const categoria =
      await this.categoriasRepository.findCategoriaById(idCategoria);

    if (!categoria) {
      throw new NotFoundException(
        `La categoría con ID ${idCategoria} no existe`,
      );
    }

    return categoria;
  }

  async obtenerSubcategoriasPorCategoria(idCategoria: number) {
    await this.obtenerCategoriaPorId(idCategoria);

    return this.categoriasRepository.findSubcategoriasByCategoria(
      idCategoria,
    );
  }
}
