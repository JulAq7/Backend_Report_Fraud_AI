import { Reporte } from '../entities/reporte.entity';

export class ReporteResponseDto {
  idReporte: number;
  idUsuario: number;
  idSubcategoria: number;
  idEstado: number;
  descripcion: string;
  plataforma: string;
  entidadReportada: string;
  publicacionAnonima: boolean;
  fechaRegistro: string;

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