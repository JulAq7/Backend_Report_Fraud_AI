import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar un usuario',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado',
    schema: {
      example: {
        idUsuario: 2,
        correoElectronico: 'ana@example.com',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'El correo ya está registrado',
  })
  register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Iniciar sesión y obtener tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'Login correcto',
    schema: {
      example: {
        accessToken: 'eyJ...',
        refreshToken: 'eyJ...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario inexistente, contraseña incorrecta o rol inválido',
  })
  login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Generar un nuevo access token',
  })
  @ApiResponse({
    status: 200,
    description: 'Access token renovado',
    schema: {
      example: {
        accessToken: 'eyJ...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
  })
  refresh(@Body() dto: RefreshDto) {
    return this.service.refresh(dto);
  }
}