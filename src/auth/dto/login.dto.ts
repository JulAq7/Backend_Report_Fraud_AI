import { IsEmail, IsString, IsInt, IsIn } from 'class-validator';

export class LoginDto {
  @IsEmail()
  correoElectronico: string | undefined;

  @IsString()
  contrasena: string | undefined;

  @IsInt()
  @IsIn([1, 2, 3])
  idRolSolicitado: number | undefined;
}