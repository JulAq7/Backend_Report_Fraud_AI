
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import type { Express, Response } from 'express';

import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { EvidenciasUploadGuard } from './evidencias-upload.guard';
import { EvidenciasService } from './evidencias.service';

@ApiTags('evidencias')
@ApiBearerAuth()
@Controller('evidencias')
@UseGuards(AuthGuard, RolesGuard)
export class EvidenciasController {
  constructor(
    private readonly evidenciasService: EvidenciasService,
  ) {}

  
  @Post('reportes/:idReporte')
  @Roles(1)
  @UseGuards(EvidenciasUploadGuard)
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const extension = extname(file.originalname).toLowerCase();
          const nombreUnico = `${randomUUID()}${extension}`;

          callback(null, nombreUnico);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
  const extension = extname(file.originalname).toLowerCase();

  const extensionesPermitidas = ['.jpg', '.jpeg', '.png'];
  const tiposPermitidos = ['image/jpeg', 'image/png'];

  if (
    !extensionesPermitidas.includes(extension) ||
    !tiposPermitidos.includes(file.mimetype)
  ) {
    callback(
  new BadRequestException(
    'Solo se permiten imágenes JPG, JPEG y PNG',
  ),
  false,
);
return;
  }

  callback(null, true);
},
    }),
  )
  @ApiOperation({
    summary: 'Subir una evidencia a un reporte propio',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        archivo: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['archivo'],
    },
  })
  async subirEvidencia(
    @Param('idReporte') idReporte: string,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    if (!archivo) {
      throw new BadRequestException(
        'Debes seleccionar un archivo',
      );
    }

    const idEvidencia =
      await this.evidenciasService.registrarEvidencia(
        Number(idReporte),
        archivo,
      );

    return {
      mensaje: 'Evidencia registrada correctamente',
      idEvidencia,
      idReporte: Number(idReporte),
      nombreArchivo: archivo.filename,
    };
  }

  // CONSULTAR Y DESCARGAR UNA EVIDENCIA
  @Get('archivos/:nombreArchivo')
  @Roles(1, 2, 3)
  @ApiOperation({
    summary: 'Consultar una evidencia con autenticación',
  })
  async obtenerArchivo(
    @Param('nombreArchivo') nombreArchivo: string,
    @Res() respuesta: Response,
  ) {
    if (basename(nombreArchivo) !== nombreArchivo) {
      throw new NotFoundException('Archivo no encontrado');
    }

    const evidencia =
      await this.evidenciasService.consultarEvidencia(
        nombreArchivo,
      );

    const rutaArchivo = join(
      process.cwd(),
      'uploads',
      nombreArchivo,
    );

    try {
      await access(rutaArchivo);
    } catch {
      throw new NotFoundException('Archivo no encontrado');
    }

    respuesta.setHeader(
  'Content-Type',
  evidencia.tipo_archivo === 'jpg'
    ? 'image/jpeg'
    : evidencia.tipo_archivo === 'png'
      ? 'image/png'
      : 'application/pdf',
);
    respuesta.setHeader(
      'Content-Disposition',
      'attachment',
    );

    respuesta.setHeader(
      'X-Content-Type-Options',
      'nosniff',
    );

    const archivo = createReadStream(rutaArchivo);

    archivo.on('error', () => {
      if (!respuesta.headersSent) {
        respuesta.status(500).end();
      } else {
        respuesta.destroy();
      }
    });

    archivo.pipe(respuesta);
  }
}
