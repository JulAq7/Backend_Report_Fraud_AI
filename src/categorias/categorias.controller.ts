
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoriasService } from './categorias.service';

@Controller('categorias')
export class CategoriasController {
  constructor(
    private readonly categoriasService: CategoriasService,
  ) {}

  @Get()
  async obtenerCategorias() {
    return this.categoriasService.obtenerCategorias();
  }

  @Get(':id/subcategorias')
  async obtenerSubcategoriasPorCategoria(
    @Param('id', ParseIntPipe) idCategoria: number,
  ) {
    return this.categoriasService.obtenerSubcategoriasPorCategoria(
      idCategoria,
    );
  }
}
