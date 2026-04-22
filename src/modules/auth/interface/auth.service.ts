import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from 'src/common/services/audit.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { UtilService } from 'src/common/services/util.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private utilService: UtilService,
    private jwtService: JwtService,
    private auditService: AuditService
  ) {}

  async register(name: string, lastName: string, username: string, email: string, password: string, role: string) {
    const hashedPassword = await this.utilService.hashPassword(password);
    const finalRole = role || 'USER';

    const user = await this.prisma.user.create({
      data: {
        name,
        lastName,
        username,
        email,
        role: finalRole,
        password: hashedPassword,
      },
    });

    await this.auditService.log(
      'USER_REGISTERED',
      user.id,
      `Usuario ${username} registrado con rol ${finalRole}`,
      undefined,
      'INFO',
    );

    const payload = {
      sub: user.id,
      username: user.username,
      name: user.name,
      lastName: user.lastName,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(username: string, password: string, ip?: string) {
    const user = await this.prisma.user.findFirst({
      where: { username },
    });

    if (!user) {
      await this.auditService.log(
        'LOGIN_FAILED',
        undefined,
        `Intento de login con usuario inexistente: ${username}`,
        ip,
        'WARNING',
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await this.utilService.checkPassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      await this.auditService.log(
        'LOGIN_FAILED',
        user.id,
        `Contraseña incorrecta para usuario: ${username}`,
        ip,
        'WARNING',
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.auditService.log(
      'LOGIN_SUCCESS',
      user.id,
      `Inicio de sesión exitoso para ${username}`,
      ip,
      'INFO',
    );

    const payload = {
      sub: user.id,
      username: user.username,
      name: user.name,
      lastName: user.lastName,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      const newPayload = {
        sub: user.id,
        username: user.username,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
      };

      const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '1d' });
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      await this.auditService.log(
        'TOKEN_REFRESHED',
        user.id,
        `Refresh token utilizado para generar nuevo access token`,
        undefined,
        'INFO',
      );

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch {
      await this.auditService.log(
        'REFRESH_TOKEN_INVALID',
        undefined,
        `Intento de refresh con token inválido`,
        undefined,
        'WARNING',
      );
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    await this.auditService.log(
      'LOGOUT',
      userId,
      `Usuario cerró sesión`,
      undefined,
      'INFO',
    );
    
    return { message: 'Logout exitoso' };
  }

}
