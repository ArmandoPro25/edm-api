import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './services/prisma.service';
import { UtilService } from './services/util.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: 'tu-clave-secreta-super-segura',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [PrismaService, UtilService],
  exports: [PrismaService, UtilService, JwtModule],
})
export class CommonModule {}
