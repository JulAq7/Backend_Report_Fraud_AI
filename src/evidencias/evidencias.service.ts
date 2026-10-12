import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EvidenciasRepository } from './evidencias.repository';
import { ReportesRepository } from '../reportes/reportes.repository';
import { BadRequestException } from '@nestjs/common';
import { open, unlink } from 'node:fs/promises';

@Injectable()
export class EvidenciasService {
  constructor(
    private readonly evidenciasRepository: EvidenciasRepository,
    private readonly reportesRepository: ReportesRepository,
  ) {}

  async verificarPermisoSubida(
    idReporte: number,
    idUsuario: number,
  ): Promise<void> {
    const reporte = await this.reportesRepository.findById(idReporte);

    if (!reporte) {
      throw new NotFoundException('El reporte no existe');
    }

    if (reporte.idUsuario !== idUsuario) {
      throw new ForbiddenException(
        'No tienes permiso para agregar evidencias a este reporte',
      );
    }
  }

  async validarContenidoImagen(
  archivo: Express.Multer.File,): Promise<void> {
  const manejador = await open(archivo.path, 'r');
  const cabecera = Buffer.alloc(8);

  try {
    const { bytesRead } = await manejador.read(
      cabecera, 0, 8, 0,
    );

    const esPNG =
      bytesRead === 8 &&
      cabecera.equals(
        Buffer.from('89504e470d0a1a0a', 'hex'),
      );

    const esJPEG =
      bytesRead >= 3 &&
      cabecera.subarray(0, 3).equals(
        Buffer.from('ffd8ff', 'hex'),
      );

    const formatoValido =
      (archivo.mimetype === 'image/png' && esPNG) ||
      (archivo.mimetype === 'image/jpeg' && esJPEG);

    if (!formatoValido) {
      throw new BadRequestException(
        'El contenido del archivo no corresponde a una imagen JPG o PNG',
      );
    }
  } finally {
    await manejador.close();
  }
}
    async registrarEvidencia(
  idReporte: number,
  archivo: Express.Multer.File,): Promise<number> {
  try {
    await this.validarContenidoImagen(archivo);

    const nombreArchivo = archivo.filename;
    const urlArchivo = `/evidencias/archivos/${nombreArchivo}`;
    const tipoArchivo =
  archivo.mimetype === 'image/jpeg' ? 'jpg' : 'png';

    return await this.evidenciasRepository.guardarEvidencia(
      idReporte,
      nombreArchivo,
      urlArchivo,
      tipoArchivo,
    );
  } catch (error) {
    await unlink(archivo.path).catch(() => undefined);
    throw error;
  }
}

    async consultarEvidencia(nombreArchivo: string) {
  const evidencia =
    await this.evidenciasRepository.buscarPorNombre(
      nombreArchivo,
    );

  if (!evidencia) {
    throw new NotFoundException(
      'La evidencia no existe',
    );
  }

  return evidencia;
}

}