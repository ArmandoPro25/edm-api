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

@Controller('api/auth')
export class AuthController {
  constructor(private authSvc: AuthService) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  public async register(@Body() createUserDto: CreateUserDto) {
    const { name, lastName, username, email, password } = createUserDto;
    return await this.authSvc.register(name, lastName, username, email, password);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() loginDto: LoginDto) {
    const { username, password } = loginDto;
    return await this.authSvc.login(username, password);
  }

  @Get('/me')
  @UseGuards(AuthGuard)
  public getProfile(@Request() req: any) {
    return req.user; // el payload que guardó el guard
  }

  @Post('/refresh')
  public refreshToken() {}

  @Post('/logout')
  public logout() {}
}
