import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateReporteDto {
  @IsInt()
  idSubcategoria: number;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  plataforma: string;

  @IsString()
  @IsNotEmpty()
  entidadReportada: string;

  @IsBoolean()
  publicacionAnonima: boolean;
}