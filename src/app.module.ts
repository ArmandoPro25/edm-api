import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/interface/auth.module';
import { TaskModule } from './modules/task/interface/task.module';
import { UserModule } from './modules/user/interface/user.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [CommonModule, AuthModule, TaskModule, UserModule],
})
export class AppModule {}
