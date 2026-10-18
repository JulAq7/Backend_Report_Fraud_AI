import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsInt,
  IsIn,
  IsOptional,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'ana@example.com',
  })
  @IsEmail()
  correoElectronico: string | undefined;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'secreto123',
  })
  @IsString()
  contrasena: string | undefined;

  @ApiPropertyOptional({
    description:
      'Rol solicitado. Es opcional; si se envía, debe coincidir con el rol real del usuario.',
    example: 1,
    enum: [1, 2, 3],
  })
  @IsOptional()
  @IsInt()
  @IsIn([1, 2, 3])
  idRolSolicitado?: number;
}