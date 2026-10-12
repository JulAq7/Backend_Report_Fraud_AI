import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReportesModule } from '../reportes/reportes.module';
import { EvidenciasController } from './evidencias.controller';
import { EvidenciasService } from './evidencias.service';
import { EvidenciasRepository } from './evidencias.repository';
import { EvidenciasUploadGuard } from './evidencias-upload.guard';

@Module({
  imports: [DatabaseModule, ReportesModule],
  controllers: [EvidenciasController],
  providers: [EvidenciasService, EvidenciasRepository, EvidenciasUploadGuard,],
})
export class EvidenciasModule {}