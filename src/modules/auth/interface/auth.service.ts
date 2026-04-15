import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/common/services/prisma.service';
import { UtilService } from 'src/common/services/util.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private utilService: UtilService,
    private jwtService: JwtService,
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

  async login(username: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await this.utilService.checkPassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

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
}
