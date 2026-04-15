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
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from '../dto/create-task.dto';
import { Task } from '../entities/task.entity';
import { AuthGuard } from 'src/common/guards/auth.guards';

@Controller('/api/task')
@UseGuards(AuthGuard)
export class TaskController {
  constructor(private tasksvc: TaskService) {}

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
  public async insertTask(@Body() task: CreateTaskDto, @Req() req: any): Promise<Task> {
    // Obtener el userId del token
    const userId = req.user.sub;
    task.user_id = userId;
  
    const result = await this.tasksvc.InsertTask(task);
    if (result == undefined || result == null) {
      throw new HttpException(
        `Error al insertar la tarea`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return result;
  }

  @Put(':id')
  public async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() taskUpdate: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksvc.updateTask(id, taskUpdate);
  }

  @Delete(':id')
  public async deleteTask(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<boolean> {
    try {
      await this.tasksvc.deleteTask(id);
    } catch {
      throw new HttpException(
        `Error al eliminar la tarea con id: ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return true;
  }
}
