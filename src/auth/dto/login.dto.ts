import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsInt, IsIn } from 'class-validator';

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

  @ApiProperty({
    description: 'Rol con el que el usuario solicita iniciar sesión',
    example: 1,
    enum: [1, 2, 3],
  })
  @IsInt()
  @IsIn([1, 2, 3])
  idRolSolicitado: number | undefined;
}