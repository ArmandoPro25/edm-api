import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(250)
  description: string;

  @IsNotEmpty()
  @IsInt()
  priority: number;

  @IsNotEmpty()
  @IsBoolean()
  completed: boolean;

  @IsNotEmpty()
  @IsString()
  dateVencimiento: string;

  @IsNotEmpty()
  @IsInt()
  user_id: number;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString( {message: "El nombre debe ser una cadena de texto"} )
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(250)
  description?: string;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsNotEmpty()
  @IsBoolean()
  completed?: boolean;

  @IsNotEmpty()
  @IsString()
  dateVencimiento?: string;
}
