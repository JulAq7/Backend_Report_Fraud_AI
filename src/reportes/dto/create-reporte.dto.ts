import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateReporteDto {
  @ApiProperty({
    description: 'Identificador de la subcategoría del reporte',
    example: 1,
  })
  @IsInt()
  idSubcategoria: number | undefined;

  @ApiProperty({
    description: 'Descripción del posible fraude o incidente',
    example: 'Recibí un mensaje solicitando datos bancarios.',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string | undefined;

  @ApiProperty({
    description: 'Plataforma donde ocurrió el incidente',
    example: 'WhatsApp',
  })
  @IsString()
  @IsNotEmpty()
  plataforma: string | undefined;

  @ApiProperty({
    description: 'Persona, empresa o entidad relacionada con el reporte',
    example: 'Banco Ejemplo',
  })
  @IsString()
  @IsNotEmpty()
  entidadReportada: string | undefined;

  @ApiProperty({
    description: 'Indica si el reporte se publica de forma anónima',
    example: true,
  })
  @IsBoolean()
  publicacionAnonima: boolean | undefined;
}