import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'ana',
  })
  @IsString()
  nombreUsuario: string | undefined;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'ana@example.com',
  })
  @IsEmail()
  correoElectronico: string | undefined;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'secreto123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  contrasena: string | undefined;
}