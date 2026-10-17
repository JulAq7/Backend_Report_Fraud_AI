
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdatePerfilDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombreUsuario?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  sexo?: string | null;

  @IsOptional()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaNacimiento?: string | null;
}
