import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  nombreUsuario: string | undefined;

  @IsEmail()
  correoElectronico: string | undefined;

  @IsString()
  @MinLength(8)
  contrasena: string | undefined;
}