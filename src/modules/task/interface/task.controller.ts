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
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from '../dto/create-task.dto';
import { Task } from '../entities/task.entity';
import { AuthGuard } from 'src/common/guards/auth.guards';
import { AuditService } from 'src/common/services/audit.service';

@Controller('/api/task')
@UseGuards(AuthGuard)
export class TaskController {
  constructor(private tasksvc: TaskService, private auditService: AuditService) {}

  @Get('my-tasks')
  async getMyTasks(@Req() req: any): Promise<Task[]> {
    const userId = req.user.sub;
    return await this.tasksvc.getTasksByUserId(userId);
  }

  @Get('my-tasks/completed')
  async getMyCompletedTasks(@Req() req: any): Promise<Task[]> {
    const userId = req.user.sub;
    return await this.tasksvc.getCompletedTasksByUserId(userId);
  }

  @Get('')
  async getAllTasks(): Promise<Task[]> {
    return await this.tasksvc.getAllTasks();
  }

  @Get(':id')
  public async listTaskById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Task> {
    const result = await this.tasksvc.getTaskById(id);
    console.log('Tipo de dato', typeof result);
    if (result == undefined || result == null) {
      throw new HttpException(
        `Tarea con id: ${id} no encontrada`,
        HttpStatus.NOT_FOUND,
      );
    }
    return result;
  }

  @Post('')
  public async insertTask(
    @Body() task: CreateTaskDto,
    @Req() req: any,
  ): Promise<Task> {
    const userId = req.user.sub;
    task.user_id = userId;

    const result = await this.tasksvc.InsertTask(task);
    if (!result) {
      throw new HttpException(
        `Error al insertar la tarea`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.auditService.log(
      'TASK_CREATED',
      userId,
      `Tarea ID ${result.id} creada: "${result.name}"`,
      req.ip,
      'INFO',
    );

    return result;
  }

  @Put(':id')
  public async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() taskUpdate: UpdateTaskDto,
    @Req() req: any,
  ): Promise<Task> {
    const task = await this.tasksvc.getTaskById(id);
    if (!task) {
      throw new HttpException('Tarea no encontrada', HttpStatus.NOT_FOUND);
    }

    if (req.user.role !== 'ADMIN' && task.user_id !== req.user.sub) {
      await this.auditService.log(
        'TASK_UPDATE_UNAUTHORIZED',
        req.user.sub,
        `Intento no autorizado de modificar tarea ID ${id}`,
        req.ip,
        'WARNING',
      );
      throw new UnauthorizedException('No puedes modificar esta tarea');
    }

    const updatedTask = await this.tasksvc.updateTask(id, taskUpdate);

    await this.auditService.log(
      'TASK_UPDATED',
      req.user.sub,
      `Tarea ID ${id} actualizada. Cambios: ${JSON.stringify(taskUpdate)}`,
      req.ip,
      'INFO',
    );

    return updatedTask;
  }

  @Delete(':id')
  public async deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<boolean> {
    const task = await this.tasksvc.getTaskById(id);
    if (!task) {
      throw new HttpException('Tarea no encontrada', HttpStatus.NOT_FOUND);
    }

    if (req.user.role !== 'ADMIN' && task.user_id !== req.user.sub) {
      await this.auditService.log(
        'TASK_DELETE_UNAUTHORIZED',
        req.user.sub,
        `Intento no autorizado de eliminar tarea ID ${id}`,
        req.ip,
        'WARNING',
      );
      throw new UnauthorizedException('No puedes eliminar esta tarea');
    }

    await this.tasksvc.deleteTask(id);

    await this.auditService.log(
      'TASK_DELETED',
      req.user.sub,
      `Tarea ID ${id} eliminada: "${task.name}"`,
      req.ip,
      'INFO',
    );

    return true;
  }
}
