import { ApiProperty } from '@nestjs/swagger';
import { Reporte } from '../entities/reporte.entity';

export class ReporteResponseDto {
  @ApiProperty({ example: 1 })
  idReporte: number | undefined;

  @ApiProperty({ example: 2 })
  idUsuario: number | undefined;

  @ApiProperty({ example: 1 })
  idSubcategoria: number | undefined;

  @ApiProperty({ example: 1 })
  idEstado: number | undefined;

  @ApiProperty({
    example: 'Recibí un mensaje solicitando datos bancarios.',
  })
  descripcion: string | undefined;

  @ApiProperty({ example: 'WhatsApp' })
  plataforma: string | undefined;

  @ApiProperty({ example: 'Banco Ejemplo' })
  entidadReportada: string | undefined;

  @ApiProperty({ example: true })
  publicacionAnonima: boolean | undefined;

  @ApiProperty({
    example: '2026-10-11T18:30:00.000Z',
    description: 'Fecha de registro en formato ISO 8601',
  })
  fechaRegistro: string | undefined;

  static fromEntity(reporte: Reporte): ReporteResponseDto {
    const dto = new ReporteResponseDto();

    dto.idReporte = reporte.idReporte;
    dto.idUsuario = reporte.idUsuario;
    dto.idSubcategoria = reporte.idSubcategoria;
    dto.idEstado = reporte.idEstado;
    dto.descripcion = reporte.descripcion;
    dto.plataforma = reporte.plataforma;
    dto.entidadReportada = reporte.entidadReportada;
    dto.publicacionAnonima = reporte.publicacionAnonima;
    dto.fechaRegistro = reporte.fechaRegistro.toISOString();

    return dto;
  }
}