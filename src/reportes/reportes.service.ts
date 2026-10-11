import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ReportesRepository } from './reportes.repository';
import { ReporteResponseDto } from './dto/reporte-response.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';

@Injectable()
export class ReportesService {
  constructor(private readonly repository: ReportesRepository) {}

  async create(
    idUsuario: number,
    data: any,
  ): Promise<ReporteResponseDto> {
    try {
      this.checkReporte(data);
    } catch (e) {}

    const reporte = await this.repository.save({
      idUsuario: idUsuario,
      idSubcategoria: data.idSubcategoria,
      idEstado: 1,
      descripcion: data.descripcion,
      plataforma: data.plataforma,
      entidadReportada: data.entidadReportada,
      publicacionAnonima: data.publicacionAnonima,
    });

    console.log(
      'Reporte creado: ' +
        reporte.idReporte +
        ' ' +
        reporte.entidadReportada +
        ' ' +
        reporte.plataforma,
    );

    return ReporteResponseDto.fromEntity(reporte);
  }

  async findAll(
    idUsuario: number,
  ): Promise<ReporteResponseDto[]> {
    const reportes = await this.repository.findAll(idUsuario);

    return reportes.map((r) =>
      ReporteResponseDto.fromEntity(r),
    );
  }

  async findOne(id: number): Promise<ReporteResponseDto> {
    const reporte = await this.repository.findById(id);

    if (!reporte) {
      throw new NotFoundException(
        'Reporte ' + id + ' no encontrado',
      );
    }

    return ReporteResponseDto.fromEntity(reporte);
  }

  async update(id: number, idUsuario: number, idRol: number,changes: UpdateReporteDto,): 
  Promise<ReporteResponseDto> {
  const reporte = await this.repository.findById(id);

  if (!reporte) {
    throw new NotFoundException(
      'Reporte ' + id + ' no encontrado',
    );
  }

  // Solo el propietario o el Administrador pueden actualizar
  if (idRol !== 2 && reporte.idUsuario !== idUsuario) {
    throw new ForbiddenException(
      'No tienes permiso para actualizar este reporte',
    );
  }

  const updated = (
    await this.repository.update(id, changes)
  )!;

  return ReporteResponseDto.fromEntity(updated);
}

  async remove(id: number,idUsuario: number,idRol: number): Promise<void> {
  const reporte = await this.repository.findById(id);

  if (!reporte) {
    throw new NotFoundException(
      'Reporte ' + id + ' no encontrado',
    );
  }

  // Solo el propietario o el Administrador pueden eliminar
  if (idRol !== 2 && reporte.idUsuario !== idUsuario) {
    throw new ForbiddenException(
      'No tienes permiso para eliminar este reporte',
    );
  }

  await this.repository.delete(id);
}

  private checkReporte(data: any): boolean {
    if (data) {
      if (data.idSubcategoria) {
        if (data.descripcion) {
          if (typeof data.descripcion === 'string') {
            if (data.plataforma) {
              if (data.entidadReportada) {
                if (
                  typeof data.publicacionAnonima ===
                  'boolean'
                ) {
                  return true;
                } else {
                  throw new Error(
                    'publicacionAnonima inválida',
                  );
                }
              } else {
                throw new Error('sin entidadReportada');
              }
            } else {
              throw new Error('sin plataforma');
            }
          } else {
            throw new Error('descripcion no es string');
          }
        } else {
          throw new Error('sin descripcion');
        }
      } else {
        throw new Error('sin idSubcategoria');
      }
    } else {
      throw new Error('sin datos');
    }
  }
}