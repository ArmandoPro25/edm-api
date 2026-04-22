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
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { UtilService } from 'src/common/services/util.service';
import { AuthGuard } from 'src/common/guards/auth.guards';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuditService } from 'src/common/services/audit.service';

@Controller('/api/user')
export class UserController {
  constructor(
    private usersvc: UserService,
    private utilSvc: UtilService,
    private auditService: AuditService,
  ) {}

  @Get('check-username')
  async checkUsername(@Query('username') username: string) {
    if (!username) {
      throw new HttpException('Username es requerido', HttpStatus.BAD_REQUEST);
    } 
    const taken = await this.usersvc.isUsernameTaken(username);
    return { available: !taken };
  }

  @Get('check-email')
  async checkEmail(@Query('email') email: string) {
    if (!email) {
      throw new HttpException('Email es requerido', HttpStatus.BAD_REQUEST);
    }
    const taken = await this.usersvc.isEmailTaken(email);
    return { available: !taken };
  }

  @Get('')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async getAllUsers(): Promise<User[]> {
    return await this.usersvc.getAllUsers();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
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
  public async insertUser(@Body() user: CreateUserDto, @Req() req: any): Promise<User> {
    const encryptedPassword = await this.utilSvc.hashPassword(user.password);
    user.password = encryptedPassword;
    const result = await this.usersvc.InsertUser(user);
    if (result == undefined || result == null) {
      throw new HttpException(
        `Error al insertar el usuario`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.auditService.log(
      'USER_CREATED',
      req.user?.sub,
      `Usuario creado: ${result.username} (ID ${result.id}) con rol ${result.role}`,
      req.ip,
      'INFO',
    );

    return result;
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  public async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() userUpdate: UpdateUserDto,
    @Req() req
  ): Promise<User> {
    if (req.user.role !== 'ADMIN' && req.user.sub !== id) {
      await this.auditService.log(
        'USER_UPDATE_UNAUTHORIZED',
        req.user.sub,
        `Intento no autorizado de editar usuario ID ${id}`,
        req.ip,
        'WARNING',
      );
      throw new UnauthorizedException('No puedes editar este perfil');
    }

    // Obtener usuario antes de actualizar para detectar cambio de rol
    const oldUser = await this.usersvc.getUserById(id);
    const oldRole = oldUser?.role;

    if (userUpdate.password) {
      userUpdate.password = await this.utilSvc.hashPassword(userUpdate.password);
    }

    const updatedUser = await this.usersvc.updateUser(id, userUpdate);

    const changes: string[] = [];
    if (oldRole && userUpdate.role && oldRole !== userUpdate.role) {
      changes.push(`rol: ${oldRole} → ${userUpdate.role}`);
    }
    await this.auditService.log(
      'USER_UPDATED',
      req.user.sub,
      `Usuario ID ${id} actualizado. Cambios: ${changes.length ? changes.join(', ') : 'datos generales'}`,
      req.ip,
      'INFO',
    );

    if (userUpdate.role && oldRole !== userUpdate.role) {
      await this.auditService.log(
        'ROLE_CHANGED',
        req.user.sub,
        `Rol de usuario ID ${id} cambiado de ${oldRole} a ${userUpdate.role}`,
        req.ip,
        'WARNING',
      );
    }

    return updatedUser;
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  public async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<boolean> {
    const userToDelete = await this.usersvc.getUserById(id);
    
    await this.usersvc.deleteUser(id);

    await this.auditService.log(
      'USER_DELETED',
      req.user.sub,
      `Usuario ID ${id} eliminado (username: ${userToDelete?.username})`,
      req.ip,
      'WARNING',
    );

    return true;
  }
}