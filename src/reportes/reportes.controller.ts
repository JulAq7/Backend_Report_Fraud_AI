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
import { UpdateEstadoDto } from './dto/update-estado.dto';
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

  @Get('pendientes')
  @Roles(2)
  findPendientes(): Promise<ReporteResponseDto[]> {
    return this.service.findPendientes();
  }  

  @Get('resumen')
  @Roles(1, 2, 3)
  @ApiOperation({
    summary: 'Consultar el resumen general de reportes',
  })
  @ApiResponse({
    status: 200,
    description:
      'Total de reportes agrupados por estado',
    schema: {
      type: 'object',
      properties: {
        total: {
          type: 'number',
          example: 15,
        },
        pendientes: {
          type: 'number',
          example: 8,
        },
        aprobados: {
          type: 'number',
          example: 5,
        },
        rechazados: {
          type: 'number',
          example: 2,
        },
      },
    },
  })
  getResumen(): Promise<{
    total: number;
    pendientes: number;
    aprobados: number;
    rechazados: number;
  }> {
    return this.service.getResumen();
  }

  @Get('estadisticas')
  @Roles(1, 2, 3)
  @ApiOperation({
    summary: 'Consultar estadísticas generales de reportes',
  })
  @ApiResponse({
    status: 200,
    description:
      'Estadísticas de reportes por estado, sexo, edad y plataforma',
  })
  getEstadisticas() {
    return this.service.getEstadisticas();
  }

  @Get('historial')
  @Roles(2)
  @ApiOperation({
    summary:
      'Consultar el historial de reportes procesados',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de reportes aprobados o rechazados',
  })
  findHistorial() {
    return this.service.findHistorial();
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



  @Patch(':id/estado')
  @Roles(2)
  @ApiOperation({
    summary: 'Actualizar el estado de un reporte',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del reporte actualizado',
    type: ReporteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Estado inválido',
  })
  @ApiResponse({
    status: 403,
    description:
      'Solo el administrador puede cambiar el estado del reporte',
  })
  @ApiResponse({
    status: 404,
    description: 'No existe un reporte con ese id',
  })
  updateEstado(
    @Param('id') id: string,
    @Body() body: UpdateEstadoDto,
  ): Promise<ReporteResponseDto> {
    return this.service.updateEstado(
      Number(id),
      body.idEstado!,
    );
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