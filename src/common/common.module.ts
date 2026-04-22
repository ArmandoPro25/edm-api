import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './services/prisma.service';
import { UtilService } from './services/util.service';
import { RolesGuard } from './guards/roles.guards';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: 'tu-clave-secreta-super-segura',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [PrismaService, UtilService, RolesGuard],
  exports: [PrismaService, UtilService, JwtModule, RolesGuard],
})
export class CommonModule {}
