import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { UtilService } from 'src/common/services/util.service';
import { AuthGuard } from 'src/common/guards/auth.guards';

@Controller('/api/user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private usersvc: UserService,
    private utilSvc: UtilService,
  ) {}

  @Get('')
  async getAllUsers(): Promise<User[]> {
    return await this.usersvc.getAllUsers();
  }

  @Get(':id')
  public async listUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User> {
    const result = await this.usersvc.getUserById(id);
    console.log('Tipo de dato', typeof result);
    if (result == undefined || result == null) {
      throw new HttpException(
        `Usuario con id: ${id} no encontrado`,
        HttpStatus.NOT_FOUND,
      );
    }
    return result;
  }

  @Post('')
  public async insertUser(@Body() user: CreateUserDto): Promise<User> {
    const encryptedPassword = await this.utilSvc.hashPassword(user.password);
    user.password = encryptedPassword;
    const result = await this.usersvc.InsertUser(user);
    if (result == undefined || result == null) {
      throw new HttpException(
        `Error al insertar el usuario`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return result;
  }

  @Put(':id')
  public async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() userUpdate: UpdateUserDto,
  ): Promise<User> {
    if (userUpdate.password) {
      userUpdate.password = await this.utilSvc.hashPassword(userUpdate.password);
    }
    return this.usersvc.updateUser(id, userUpdate);
  }

  @Delete(':id')
  public async deleteUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<boolean> {
    await this.usersvc.deleteUser(id);
    return true;
  }
}