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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt';

import { ReportesService } from './reportes.service';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { ReporteResponseDto } from './dto/reporte-response.dto';

@ApiTags('reportes')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Falta el token, es inválido o expiró',
})
@Controller('reportes')
@UseGuards(AuthGuard, RolesGuard)
export class ReportesController {
  constructor(private readonly service: ReportesService) {}

  @Post()
  @Roles(1)
  @ApiOperation({
    summary: 'Crear un reporte',
  })
  @ApiResponse({
    status: 201,
    description: 'Reporte creado',
    type: ReporteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 403,
    description: 'El rol del usuario no tiene permiso para crear reportes',
  })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateReporteDto,
  ): Promise<ReporteResponseDto> {
    return this.service.create(Number(user.sub), dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar los reportes del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reportes',
    type: [ReporteResponseDto],
  })
  findAll(
    @CurrentUser() user: JwtPayload,
  ): Promise<ReporteResponseDto[]> {
    return this.service.findAll(Number(user.sub));
  }

  @Get(':id')
  @Roles(1, 2, 3)
  @ApiOperation({
    summary: 'Consultar un reporte por id',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte encontrado',
    type: ReporteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No existe un reporte con ese id',
  })
  @ApiResponse({
    status: 403,
    description: 'El rol del usuario no tiene permiso para consultar el reporte',
  })
  findOne(
    @Param('id') id: string,
  ): Promise<ReporteResponseDto> {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  @Roles(1, 2)
  @ApiOperation({
    summary: 'Actualizar un reporte',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte actualizado',
    type: ReporteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permiso para actualizar este reporte',
  })
  @ApiResponse({
    status: 404,
    description: 'No existe un reporte con ese id',
  })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateReporteDto,
  ): Promise<ReporteResponseDto> {
    return this.service.update(
      Number(id),
      Number(user.sub),
      user.idRol,
      dto,
    );
  }

  @Delete(':id')
  @Roles(1, 2)
  @HttpCode(204)
  @ApiOperation({
    summary: 'Eliminar un reporte',
  })
  @ApiResponse({
    status: 204,
    description: 'Reporte eliminado; sin cuerpo',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permiso para eliminar este reporte',
  })
  @ApiResponse({
    status: 404,
    description: 'No existe un reporte con ese id',
  })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.service.remove(
      Number(id),
      Number(user.sub),
      user.idRol,
    );
  }
}