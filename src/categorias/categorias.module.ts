
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';
import { CategoriasRepository } from './categorias.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoriasController],
  providers: [CategoriasService, CategoriasRepository],
})
export class CategoriasModule {}
