import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  correoElectronico: string | undefined;

  @IsString()
  contrasena: string | undefined;
}