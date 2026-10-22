import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';

import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { sign, verify } from './jwt';
import { UsersRepository } from './users.repository';

const ACCESS_TTL = 15 * 60;
const REFRESH_TTL = 7 * 24 * 60 * 60;

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{
    idUsuario: number;
    correoElectronico: string;
  }> {
    if (
      await this.users.findByEmail(
        dto.correoElectronico!,
      )
    ) {
      throw new ConflictException(
        'El correo ya está registrado',
      );
    }

    const contrasenaHash = await bcrypt.hash(
      dto.contrasena!,
      BCRYPT_ROUNDS,
    );

    const user = await this.users.save(
      dto.nombreUsuario!,
      dto.correoElectronico!,
      contrasenaHash,
    );

    return {
      idUsuario: user.idUsuario!,
      correoElectronico:
        user.correoElectronico!,
    };
  }

  async registerAdmin(
    dto: RegisterDto,
  ): Promise<{
    idUsuario: number;
    correoElectronico: string;
    idRol: number;
  }> {
    if (
      await this.users.findByEmail(
        dto.correoElectronico!,
      )
    ) {
      throw new ConflictException(
        'El correo ya está registrado',
      );
    }

    const contrasenaHash = await bcrypt.hash(
      dto.contrasena!,
      BCRYPT_ROUNDS,
    );

    const user = await this.users.save(
      dto.nombreUsuario!,
      dto.correoElectronico!,
      contrasenaHash,
      2,
    );

    return {
      idUsuario: user.idUsuario!,
      correoElectronico:
        user.correoElectronico!,
      idRol: user.idRol!,
    };
  }

  async login(
    dto: LoginDto,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.users.findByEmail(
      dto.correoElectronico!,
    );

    if (!user) {
      throw new UnauthorizedException(
        'Credenciales inválidas',
      );
    }

    const contrasenaCorrecta =
      await this.validarContrasena(
        dto.contrasena!,
        user.contrasenaHash!,
        user.idUsuario!,
      );

    if (!contrasenaCorrecta) {
      throw new UnauthorizedException(
        'Credenciales inválidas',
      );
    }

    if (
      dto.idRolSolicitado !== undefined &&
      user.idRol !== dto.idRolSolicitado
    ) {
      throw new UnauthorizedException(
        'Permiso denegado',
      );
    }

    const claims = {
      sub: String(user.idUsuario!),
      email: user.correoElectronico!,
      idRol: user.idRol!,
    };

    const accessToken = sign(
      {
        ...claims,
        type: 'access',
      },
      ACCESS_TTL,
    );

    const refreshToken = sign(
      {
        ...claims,
        type: 'refresh',
      },
      REFRESH_TTL,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  refresh(
    dto: RefreshDto,
  ): {
    accessToken: string;
  } {
    const payload = verify(
      dto.refreshToken!,
    );

    if (
      !payload ||
      payload.type !== 'refresh'
    ) {
      throw new UnauthorizedException(
        'Refresh token inválido',
      );
    }

    const accessToken = sign(
      {
        sub: payload.sub,
        email: payload.email,
        idRol: payload.idRol,
        type: 'access',
      },
      ACCESS_TTL,
    );

    return {
      accessToken,
    };
  }

  private async validarContrasena(
    contrasena: string,
    hashGuardado: string,
    idUsuario: number,
  ): Promise<boolean> {
    if (esHashBcrypt(hashGuardado)) {
      return bcrypt.compare(
        contrasena,
        hashGuardado,
      );
    }

    const hashAnterior =
      hashSha256(contrasena);

    if (hashAnterior !== hashGuardado) {
      return false;
    }

    const nuevoHash = await bcrypt.hash(
      contrasena,
      BCRYPT_ROUNDS,
    );

    await this.users.updatePasswordHash(
      idUsuario,
      nuevoHash,
    );

    return true;
  }
}

function esHashBcrypt(
  hash: string,
): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(hash);
}

function hashSha256(
  contrasena: string,
): string {
  return createHash('sha256')
    .update(contrasena)
    .digest('hex');
}