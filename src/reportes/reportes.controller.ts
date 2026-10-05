import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { ReporteResponseDto } from './dto/reporte-response.dto';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly service: ReportesService) {}

  @Post()
  create(
    @Body() dto: CreateReporteDto,): Promise<ReporteResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<ReporteResponseDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Promise<ReporteResponseDto> {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReporteDto,
  ): Promise<ReporteResponseDto> {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(Number(id));
  }
}