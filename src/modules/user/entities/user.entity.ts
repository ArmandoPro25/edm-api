import { Task } from "src/modules/task/entities/task.entity";

export class User {
  id!: number;
  name!: string;
  lastName!: string;
  username!: string;
  email!: string;
  password?: string;
  role?: string;
  createdAt!: Date;
  task?: Task[];
}
