import { ForbiddenException, Injectable, NotFoundException, BadRequestException} from '@nestjs/common';
import { ReportesRepository } from './reportes.repository';
import { ReporteResponseDto } from './dto/reporte-response.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';



/**
 * Reglas de negocio de los reportes.
 *
 * No sabe de HTTP ni de SQL: recibe DTOs ya validados, habla con el
 * repository y regresa `ReporteResponseDto`. Los errores de negocio se
 * expresan como excepciones de Nest para que el controller no tenga que
 * traducirlas.
 */

@Injectable()
export class ReportesService {
  constructor(private readonly repository: ReportesRepository) {}
    /**
   * Crea un reporte.
   * @param idUsuario - Id del usuario autenticado obtenido desde el JWT.
   * @param data - Campos del reporte, ya validados por el `ValidationPipe`.
   * @returns El reporte guardado, con `idReporte` y `fechaRegistro` asignados por la BD.
   */

  async create(
    idUsuario: number,
    data: any,
  ): Promise<ReporteResponseDto> {
    this.checkReporte(data);

    const reporte = await this.repository.save({
      idUsuario: idUsuario,
      idSubcategoria: data.idSubcategoria,
      idEstado: 1,
      descripcion: data.descripcion,
      plataforma: data.plataforma,
      entidadReportada: data.entidadReportada,
      publicacionAnonima: data.publicacionAnonima,
    });

    return ReporteResponseDto.fromEntity(reporte);
  }

  /**
  * Lista los reportes del usuario autenticado.
  * @param idUsuario - Id del usuario cuyos reportes se van a consultar.
  * @returns Los reportes asociados a ese usuario.
  */
  async findAll(
    idUsuario: number,
  ): Promise<ReporteResponseDto[]> {
    const reportes = await this.repository.findAll(idUsuario);

    return reportes.map((r) =>
      ReporteResponseDto.fromEntity(r),
    );
  }

  async findPendientes() {
    const reportes = await this.repository.findPendientes();

    return reportes.map(
      ({ reporte, categoria, subcategoria }) => ({
        ...ReporteResponseDto.fromEntity(reporte),
        categoria,
        subcategoria,
      }),
    );
  }

  async findHistorial() {
    const reportes =
      await this.repository.findHistorial();

    return reportes.map(
      ({ reporte, categoria, subcategoria }) => ({
        ...ReporteResponseDto.fromEntity(reporte),
        categoria,
        subcategoria,
      }),
    );
  }

  
  /**
   * Consulta los reportes públicos aprobados.
   * Permite buscar por texto cuando se proporciona un término.
   */
  async findPublicos(buscar?: string) {
    if (buscar !== undefined && typeof buscar !== 'string') {
      throw new BadRequestException(
        'El término de búsqueda debe ser texto',
      );
    }

    const termino = buscar?.trim() ?? '';

    if (termino.length > 150) {
      throw new BadRequestException(
        'El término de búsqueda es demasiado largo',
      );
    }

    return this.repository.findPublicos(termino);
  }


  /**
   * Obtiene el resumen general de reportes por estado.
   * @returns Total de reportes, pendientes, aprobados y rechazados.
   */
  async getResumen(): Promise<{
    total: number;
    pendientes: number;
    aprobados: number;
    rechazados: number;
  }> {
    return this.repository.getResumen();
  }


  /**
   * Obtiene las estadísticas generales de los reportes.
   * @returns Estadísticas por estado, sexo, rango de edad y plataforma.
   */
  async getEstadisticas() {
    const resumen = await this.repository.getResumen();
    const estadisticas =
      await this.repository.getEstadisticas();

    return {
      totalReportes: resumen.total,

      porEstado: {
        enRevision: resumen.pendientes,
        aprobados: resumen.aprobados,
        rechazados: resumen.rechazados,
      },

      porSexo: estadisticas.porSexo,
      porRangoEdad: estadisticas.porRangoEdad,
      porPlataforma: estadisticas.porPlataforma,
    };
  }

  /**
  * Busca un reporte por id.
  * @param id - Id numérico del reporte.
  * @returns El reporte encontrado.
  * @throws NotFoundException si no existe un reporte con ese id.
  */
  async findOne(id: number, idUsuario: number, idRol: number) {
    const detalle =
      await this.repository.findDetalleById(id);

    const esAjenoNoPublico =
      detalle !== undefined &&
      idRol === 1 &&
      detalle.reporte.idUsuario !== idUsuario &&
      detalle.reporte.idEstado !== 2;

    if (!detalle || esAjenoNoPublico) {
      throw new NotFoundException(
        'Reporte ' + id + ' no encontrado',
      );
    }

    return {
      ...ReporteResponseDto.fromEntity(
        detalle.reporte,
      ),
      categoria: detalle.categoria,
      subcategoria: detalle.subcategoria,
    };
  }


  async updateEstado(
    id: number,
    idEstado: number,
  ): Promise<ReporteResponseDto> {
    const reporte = await this.repository.findById(id);

    if (!reporte) {
      throw new NotFoundException(
        'Reporte ' + id + ' no encontrado',
      );
    }

    if (![1, 2, 3].includes(idEstado)) {
      throw new BadRequestException(
        'El estado debe ser 1, 2 o 3',
      );
    }

    const updated = await this.repository.updateEstado(
      id,
      idEstado,
    );

    return ReporteResponseDto.fromEntity(updated!);
  }

  /**
 * Actualiza un reporte.
 * @param id - Id numérico del reporte.
 * @param idUsuario - Id del usuario autenticado.
 * @param idRol - Rol del usuario autenticado.
 * @param changes - Campos del reporte que se desean actualizar.
 * @returns El reporte actualizado.
 * @throws NotFoundException si no existe un reporte con ese id.
 * @throws ForbiddenException si el usuario no es propietario ni administrador.
 */
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


  /**
  * Elimina un reporte.
  * @param id - Id numérico del reporte.
  * @param idUsuario - Id del usuario autenticado.
  * @param idRol - Rol del usuario autenticado.
  * @throws NotFoundException si no existe un reporte con ese id.
  * @throws ForbiddenException si el usuario no es propietario ni administrador.
  */
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
    if (!data) {
      throw new BadRequestException('sin datos');
    }

    if (!data.idSubcategoria) {
      throw new BadRequestException('sin idSubcategoria');
    }

    if (!data.descripcion) {
      throw new BadRequestException('sin descripcion');
    }

    if (typeof data.descripcion !== 'string') {
      throw new BadRequestException('descripcion no es string');
    }

    if (!data.plataforma) {
      throw new BadRequestException('sin plataforma');
    }

    if (!data.entidadReportada) {
      throw new BadRequestException('sin entidadReportada');
    }

    if (typeof data.publicacionAnonima !== 'boolean') {
      throw new BadRequestException('publicacionAnonima inválida');
    }

    return true;
  }
}