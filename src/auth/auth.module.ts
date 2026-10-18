import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { UsersRepository } from './users.repository';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, AuthGuard, RolesGuard,],
  exports: [AuthGuard, RolesGuard,],
})
export class AuthModule {}