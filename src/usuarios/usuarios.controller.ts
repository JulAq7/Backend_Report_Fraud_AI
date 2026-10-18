
import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt';

import { UsuariosService } from './usuarios.service';
import { UpdatePerfilDto } from './dto/update-perfil.dto';

@ApiTags('usuarios')
@ApiBearerAuth()
@Controller('usuarios')
@UseGuards(AuthGuard)
export class UsuariosController {
  constructor(
    private readonly service: UsuariosService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Consultar el perfil del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido correctamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o no proporcionado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  obtenerPerfil(
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.obtenerPerfil(Number(user.sub));
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Actualizar el perfil del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o no proporcionado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'El nombre de usuario ya está en uso',
  })
  actualizarPerfil(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdatePerfilDto,
  ) {
    return this.service.actualizarPerfil(
      Number(user.sub),
      dto,
    );
  }
}
