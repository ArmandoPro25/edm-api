import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../dto/logindto';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { AuthGuard } from 'src/common/guards/auth.guards';
import { RefreshTokenDto } from '../entities/refresh-token.entity';

@Controller('api/auth')
export class AuthController {
  constructor(private authSvc: AuthService) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    const { name, lastName, username, email, password, role } = createUserDto;
    const finalRole = role || 'USER';
    return await this.authSvc.register(name, lastName, username, email, password, finalRole);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Request() req: any) {
    const { username, password } = loginDto;
    const ip = req.ip || req.connection?.remoteAddress;
    return await this.authSvc.login(username, password, ip);
  }

  @Post('/refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authSvc.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('/logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any) {
    return await this.authSvc.logout(req.user.sub);
  }

  @Get('/me')
  @UseGuards(AuthGuard)
  getProfile(@Request() req: any) {
    return req.user;
  }
}