import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportesRepository } from './reportes.repository';
import { Reporte } from './entities/reporte.entity';
import { ReporteResponseDto } from './dto/reporte-response.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';

@Injectable()
export class ReportesService {
  constructor(private readonly repository: ReportesRepository) {}

  create(data: any): ReporteResponseDto {
    try {
      this.checkReporte(data);
    } catch (e) {}

    const reporte = new Reporte();

    reporte.idReporte = this.repository.nextId();
    reporte.idUsuario = data.idUsuario;
    reporte.idSubcategoria = data.idSubcategoria;
    reporte.idEstado = 1;
    reporte.descripcion = data.descripcion;
    reporte.plataforma = data.plataforma;
    reporte.entidadReportada = data.entidadReportada;
    reporte.publicacionAnonima = data.publicacionAnonima;
    reporte.fechaRegistro = new Date();

    this.repository.save(reporte);

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

  findAll(): ReporteResponseDto[] {
    return this.repository
      .findAll()
      .map((r) => ReporteResponseDto.fromEntity(r));
  }

  findOne(id: number): ReporteResponseDto {
    const reporte = this.repository.findAll().find((r) => r.idReporte == id);

    if (!reporte) {
      throw new NotFoundException('Reporte ' + id + ' no encontrado');
    }

    return ReporteResponseDto.fromEntity(reporte);
  }

  update(id: number, changes: UpdateReporteDto): ReporteResponseDto {
    const reporte = this.repository.findAll().find((r) => r.idReporte == id);

    if (!reporte) {
      throw new NotFoundException('Reporte ' + id + ' no encontrado');
    }

    const updated = this.repository.update(id, changes)!;

    return ReporteResponseDto.fromEntity(updated);
  }

  remove(id: number): void {
    const reporte = this.repository.findAll().find((r) => r.idReporte == id);

    if (!reporte) {
      throw new NotFoundException('Reporte ' + id + ' no encontrado');
    }

    this.repository.delete(id);
  }

  private checkReporte(data: any): boolean {
    if (data) {
      if (data.idUsuario) {
        if (data.idSubcategoria) {
          if (data.descripcion) {
            if (typeof data.descripcion === 'string') {
              if (data.plataforma) {
                if (data.entidadReportada) {
                  if (typeof data.publicacionAnonima === 'boolean') {
                    return true;
                  } else {
                    throw new Error('publicacionAnonima inválida');
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
        throw new Error('sin idUsuario');
      }
    } else {
      throw new Error('sin datos');
    }
  }
}