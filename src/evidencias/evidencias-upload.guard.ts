import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { EvidenciasService } from './evidencias.service';

@Injectable()
export class EvidenciasUploadGuard implements CanActivate {
  constructor(
    private readonly evidenciasService: EvidenciasService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const idReporte = Number(request.params.idReporte);
    const idUsuario = Number(request.user.sub);

    await this.evidenciasService.verificarPermisoSubida(
      idReporte,
      idUsuario,
    );

    return true;
  }
}