import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { mysqlProvider } from 'src/common/providers/mysql.provider';
import { PrismaService } from 'src/common/services/prisma.service';

@Module({
  controllers: [TaskController],
  providers: [TaskService, mysqlProvider, PrismaService],
})
export class TaskModule {}
