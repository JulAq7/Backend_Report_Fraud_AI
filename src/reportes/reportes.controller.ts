import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt';
import { ReportesService } from './reportes.service';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { ReporteResponseDto } from './dto/reporte-response.dto';

@Controller('reportes')
@UseGuards(AuthGuard)
export class ReportesController {
  constructor(private readonly service: ReportesService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateReporteDto,
  ): Promise<ReporteResponseDto> {
    return this.service.create(Number(user.sub), dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
  ): Promise<ReporteResponseDto[]> {
    return this.service.findAll(Number(user.sub));
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ReporteResponseDto> {
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